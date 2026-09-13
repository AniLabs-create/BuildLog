from typing import Optional
from urllib.parse import quote
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user
from app.services import github_oauth
from app.services.github_oauth import GitHubOAuthError

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Validates unique username and email, hashes the password with bcrypt,
    and returns a signed JWT access token.
    """
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == req.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken.",
        )

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == req.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered.",
        )

    # Hash the password securely
    hashed_pwd = hash_password(req.password)

    # Create new user record
    new_user = User(
        username=req.username,
        email=req.email,
        password_hash=hashed_pwd,
        skills=[],
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue JWT token
    access_token = create_access_token(data={"sub": str(new_user.id)})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user using username or email and password.
    Returns a signed JWT access token on success.
    """
    # Find user by username or email
    user = db.query(User).filter(
        or_(User.username == req.identifier, User.email == req.identifier)
    ).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your username/email and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue JWT token
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Return the profile of the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)


# ---------- GitHub OAuth (authorization-code flow) ----------

def _oauth_redirect_to_login(message: str) -> RedirectResponse:
    """Send the browser back to the React app with a user-friendly error."""
    return RedirectResponse(
        f"{settings.FRONTEND_URL.rstrip('/')}/login?oauth_error={quote(message)}",
        status_code=302,
    )


def _github_redirect_uri(request: Request) -> str:
    """Explicit env override, or derive from the incoming request (local dev)."""
    if settings.GITHUB_REDIRECT_URI.strip():
        return settings.GITHUB_REDIRECT_URI.strip()
    return str(request.base_url).rstrip("/") + "/api/auth/github/callback"


@router.get("/github/login")
async def github_login(request: Request):
    """
    Step 1: redirect the browser to GitHub's authorize page.
    Sets a short-lived HttpOnly state cookie for CSRF protection.
    """
    if not github_oauth.is_github_configured():
        return _oauth_redirect_to_login(
            "GitHub login is not configured yet. Use email and password."
        )

    state = github_oauth.generate_state()

    response = RedirectResponse(
        github_oauth.build_authorize_url(state, _github_redirect_uri(request)), status_code=302
    )
    response.set_cookie(
        key="oauth_state",
        value=state,
        max_age=600,  # 10 minutes to complete authorization
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
    )
    return response


@router.get("/github/callback")
async def github_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Step 2: GitHub redirects here after the user approves (or cancels).
    Verifies state, exchanges the code, links or creates the BuildLog
    account, then redirects to the React app with a JWT in the URL
    fragment ('#token=...' — fragments are never sent to servers).
    """
    # User clicked "Cancel" on GitHub's authorization page
    if error:
        message = (
            "GitHub authorization was cancelled."
            if error == "access_denied"
            else "GitHub login failed. Please try again."
        )
        return _oauth_redirect_to_login(message)

    # CSRF check: the state must match the cookie set in step 1
    cookie_state = request.cookies.get("oauth_state")
    if not state or not cookie_state or state != cookie_state:
        return _oauth_redirect_to_login(
            "Login could not be verified (invalid state). Please try again."
        )

    if not code:
        return _oauth_redirect_to_login("No authorization code received from GitHub.")

    # Exchange the code and fetch the GitHub profile
    try:
        access_token = await github_oauth.exchange_code_for_token(
            code, _github_redirect_uri(request)
        )
        profile = await github_oauth.fetch_github_profile(access_token)
    except GitHubOAuthError as e:
        return _oauth_redirect_to_login(str(e))
    except Exception:
        return _oauth_redirect_to_login("GitHub is unavailable right now. Please try again.")

    github_id: int = profile["id"]
    github_login_name: str = profile.get("login") or f"gh{github_id}"
    github_email: Optional[str] = profile.get("email")

    # 1) Existing account already linked to this GitHub identity -> log them in
    user = db.query(User).filter(User.github_id == github_id).first()

    if not user and github_email:
        # 2) Account with the same verified email -> link it (no duplicates)
        user = db.query(User).filter(User.email == github_email).first()
        if user is not None:
            if user.github_id is not None and user.github_id != github_id:
                # Extremely rare: email reused across GitHub accounts; don't hijack
                return _oauth_redirect_to_login(
                    "This email belongs to another linked GitHub account."
                )
            user.github_id = github_id

    if not user:
        # 3) New user -> create an account in "setup incomplete" state.
        #    The unusable password hash blocks password login until they set one.
        #    If the suggested username is taken (rare: it already embeds part of
        #    the GitHub ID), suffix it until it is free.
        suggested = github_oauth.suggest_username(github_login_name, github_id)
        username = suggested
        counter = 2
        while db.query(User).filter(User.username == username).first() is not None:
            username = f"{suggested[:28]}_{counter}"
            counter += 1

        user = User(
            username=username,
            email=github_email or github_oauth.fallback_email(github_login_name, github_id),
            password_hash=hash_password(secrets.token_urlsafe(32)),
            display_name=profile.get("name") or github_login_name,
            avatar_url=profile.get("avatar_url"),
            github_url=profile.get("html_url"),
            skills=[],
            github_id=github_id,
            profile_setup_complete=False,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    jwt_token = create_access_token(data={"sub": str(user.id)})
    response = RedirectResponse(
        f"{github_oauth_url_frontend()}/oauth/callback#token={jwt_token}",
        status_code=302,
    )
    response.delete_cookie("oauth_state")
    return response
