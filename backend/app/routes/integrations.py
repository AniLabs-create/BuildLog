"""Integration endpoints: GitHub connect/sync/push, LeetCode connect/sync.

Security model:
- Every JSON endpoint requires the standard BuildLog JWT.
- The GitHub connect flow uses a short-lived signed state JWT in an
  HttpOnly cookie: the browser carries it through GitHub's redirect, so
  the callback knows which BuildLog user to attach the token to WITHOUT
  the token ever appearing in a URL.
- The GitHub access token is encrypted at rest and never returned.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from urllib.parse import quote

from app.config import settings
from app.database import get_db
from app.models.integration import GitHubIntegration as GitHubIntegrationModel
from app.models.project import Project
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.utils.security import create_access_token, decode_access_token
from app.integrations.base import registry
from app.integrations.github import client as github_client
from app.services import github_oauth
from app.services.github_oauth import GitHubOAuthError

router = APIRouter(prefix="/integrations", tags=["integrations"])

CONNECT_SCOPES = "repo read:user"  # repo = private repo sync + solution pushes
COOKIE_NAME = "github_connect_state"


def _frontend() -> str:
    return settings.FRONTEND_URL.rstrip("/")


def _github_provider(db: Session) -> Any:
    return registry.get("github")


def _leet_provider() -> Any:
    return registry.get("leetcode")


def _provider_status(db: Session, user_id: int, provider: str) -> Optional[dict]:
    integration = registry.get(provider)
    return integration.status(db, user_id)


# ---------- Status (both providers; used by Settings + dashboard) ----------

@router.get("/status")
def integrations_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "github": _provider_status(db, current_user.id, "github"),
        "leetcode": _provider_status(db, current_user.id, "leetcode"),
    }


# ---------- GitHub: connect (OAuth, separate from login) ----------

@router.get("/github/connect")
def github_connect(
    current_user: User = Depends(get_current_user),
    response: Response = None,
    return_to: str = "/settings",
):
    """
    Returns the GitHub authorize URL for the INTEGRATION connection.
    The frontend opens it in the browser; the signed state carries the
    user's id through the redirect inside an HttpOnly cookie.
    """
    if not github_oauth.is_github_configured():
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="GitHub integration is not configured on the server.",
        )

    # Only onboarding and settings may be the post-connection landing spot
    if return_to not in ("/settings", "/setup"):
        return_to = "/settings"

    state = create_access_token(
        data={
            "sub": str(current_user.id),
            "typ": "github_connect",
            "return_to": return_to,
        },
        expires_delta=timedelta(minutes=10),
    )
    connect_redirect_uri = settings.GITHUB_REDIRECT_URI.replace(
        "/auth/github/callback", "/integrations/github/callback"
    ).strip()
    if not connect_redirect_uri:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="GITHUB_REDIRECT_URI must be configured for the integration flow.",
        )

    authorize_url = github_oauth.build_authorize_url(state, connect_redirect_uri, scope=CONNECT_SCOPES)
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie(
        key=COOKIE_NAME,
        value=state,
        max_age=600,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
    )
    return {"authorize_url": authorize_url}


@router.get("/github/callback")
async def github_connect_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """GitHub redirects here after the user approves the INTEGRATION connection."""
    def back(message: str, ok: bool = False, return_to: str = "/settings") -> RedirectResponse:
        param = ("github=" + ("connected" if ok else quote(message)))
        return RedirectResponse(f"{_frontend()}{return_to}?{param}", status_code=302)

    if error:
        return back(
            "cancelled" if error == "access_denied" else "GitHub connection failed."
        )

    cookie_state = request.cookies.get(COOKIE_NAME)
    if not state or not cookie_state or state != cookie_state:
        return back("Connection could not be verified. Please try again.")

    payload = decode_access_token(state)
    if not payload or payload.get("typ") != "github_connect":
        return back("Connection session expired. Please try again.")

    return_to = payload.get("return_to") if isinstance(payload.get("return_to"), str) else "/settings"
    if return_to not in ("/settings", "/setup"):
        return_to = "/settings"

    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return back("Account not found.", return_to=return_to)

    if not code:
        return back("No authorization code received from GitHub.", return_to=return_to)

    redirect_uri = settings.GITHUB_REDIRECT_URI.replace(
        "/auth/github/callback", "/integrations/github/callback"
    )

    try:
        access_token = await github_oauth.exchange_code_for_token(code, redirect_uri)
        profile = await github_oauth.fetch_github_profile(access_token)
    except GitHubOAuthError as e:
        return back(str(e), return_to=return_to)
    except Exception:
        return back("GitHub is unavailable right now. Please try again.", return_to=return_to)

    from app.models.integration import GitHubIntegration
    from app.utils.encryption import encrypt_secret

    integration = (
        db.query(GitHubIntegration).filter(GitHubIntegration.user_id == user.id).first()
    )
    if integration:
        integration.github_user_id = profile["id"]
        integration.github_username = profile.get("login") or user.username
        integration.avatar_url = profile.get("avatar_url")
        integration.access_token_encrypted = encrypt_secret(access_token)
        integration.scopes = CONNECT_SCOPES
        integration.connected_at = datetime.now(timezone.utc)
    else:
        db.add(GitHubIntegration(
            user_id=user.id,
            github_user_id=profile["id"],
            github_username=profile.get("login") or user.username,
            avatar_url=profile.get("avatar_url"),
            access_token_encrypted=encrypt_secret(access_token),
            scopes=CONNECT_SCOPES,
        ))
    db.commit()
    return back("", ok=True, return_to=return_to)


@router.delete("/github", status_code=status.HTTP_200_OK)
def github_disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disconnect GitHub: revokes the token and deletes the connection row.
    Synced projects and activity history are kept."""
    registry.get("github").disconnect(db, current_user.id)
    return {"status": "DISCONNECTED", "message": "GitHub disconnected. Your projects and activity were kept."}


# ---------- GitHub: sync ----------

@router.post("/github/sync")
def github_sync(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync repositories into Projects and public events into activity."""
    try:
        summary = registry.get("github").sync(db, current_user.id)
    except KeyError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="GitHub is not connected.")
    except github_client.GitHubApiError as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=str(e))
    return summary


@router.get("/github/repositories")
def github_repositories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """The user's synced GitHub repositories (as BuildLog projects)."""
    projects = (
        db.query(Project)
        .filter(
            Project.user_id == current_user.id,
            Project.source == "github",
        )
        .order_by(Project.stars.desc(), Project.updated_at.desc())
        .all()
    )
    return [
        {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "description": p.description,
            "github_url": p.github_url,
            "stars": p.stars,
            "forks": p.forks,
            "visibility": p.visibility,
            "last_synced_at": p.last_synced_at.isoformat() if p.last_synced_at else None,
        }
        for p in projects
    ]


@router.get("/github/activity")
def github_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.external_activity import ExternalActivity

    rows = (
        db.query(ExternalActivity)
        .filter(ExternalActivity.user_id == current_user.id, ExternalActivity.source == "github")
        .order_by(ExternalActivity.occurred_at.desc())
        .limit(50)
        .all()
    )
    return [_serialize_external_activity(r) for r in rows]


def _serialize_external_activity(row) -> dict:
    return {
        "id": row.id,
        "source": row.source,
        "type": row.type,
        "repository": row.repository,
        "title": row.title,
        "url": row.url,
        "occurred_at": row.occurred_at.isoformat(),
    }


# ---------- GitHub: push solution ----------

class PushSolutionRequest(BaseModel):
    external_id: str = Field(..., description="GitHub repo ID (from synced repositories)")
    path: str = Field(..., min_length=1, max_length=300, description="File path in the repo, e.g. python/two-sum.py")
    content: str = Field(..., min_length=1, max_length=100_000, description="File contents (the solution code)")
    commit_message: str = Field(..., min_length=1, max_length=300)
    branch: Optional[str] = None


@router.post("/github/push")
def github_push_solution(
    req: PushSolutionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create/update a file in one of the user's OWN GitHub repositories.
    Ownership is verified against the synced project, and GitHub's own
    permission check is the final gate (the token must have push access).
    """
    integration = (
        db.query(GitHubIntegrationModel)
        .filter(GitHubIntegrationModel.user_id == current_user.id)
        .first()
    )
    if not integration:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="GitHub is not connected.")

    # Ownership: the repo must be one of the user's synced GitHub projects
    project = (
        db.query(Project)
        .filter(
            Project.user_id == current_user.id,
            Project.source == "github",
            Project.external_id == req.external_id,
        )
        .first()
    )
    if not project or not project.github_url:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="That repository is not connected to your BuildLog account.",
        )

    # github_url looks like https://github.com/owner/repo
    parts = project.github_url.rstrip("/").split("github.com/")[-1].split("/")
    if len(parts) < 2:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Could not resolve the repository.")
    owner, repo = parts[0], parts[1]

    token = github_client.decrypt_token(integration)
    try:
        result = github_client.push_file(
            token, owner, repo,
            path=req.path.strip().lstrip("/"),
            content=req.content,
            commit_message=req.commit_message.strip(),
            branch=req.branch,
        )
    except github_client.GitHubApiError as e:
        message = str(e)
        if "permission" in message.lower() or "404" in message:
            message = "Your GitHub connection lacks write access to that repository. Reconnect GitHub with the repo scope."
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=message)

    return {
        "status": "PUSHED",
        "commit_url": result.get("commit_url"),
        "repository": f"{owner}/{repo}",
        "path": req.path,
    }


# ---------- LeetCode ----------

class LeetCodeConnectRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)


@router.post("/leetcode/connect")
def leetcode_connect(
    req: LeetCodeConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Connect a public LeetCode profile by username (no credentials needed)."""
    from app.integrations.leetcode.integration import leetcode_integration as provider
    from app.integrations.leetcode.client import LeetCodeError

    try:
        profile = provider.connect(db, current_user.id, req.username)
    except LeetCodeError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"status": "CONNECTED", "profile": profile}


@router.post("/leetcode/sync")
def leetcode_sync(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.integrations.leetcode.integration import leetcode_integration as provider
    from app.integrations.leetcode.client import LeetCodeError

    try:
        return provider.sync(db, current_user.id)
    except KeyError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="LeetCode is not connected.")
    except LeetCodeError as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.delete("/leetcode")
def leetcode_disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    registry.get("leetcode").disconnect(db, current_user.id)
    return {"status": "DISCONNECTED", "message": "LeetCode disconnected. Your activity history was kept."}
