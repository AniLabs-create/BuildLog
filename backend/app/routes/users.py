import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.build_log import BuildLog
from app.models.follow import Follow
from app.schemas.user import (
    PublicProfileResponse,
    PublicActivityItem,
    ProfileUpdateRequest,
    UserResponse,
)
from app.schemas.project import ProjectResponse
from app.schemas.build_log import BuildLogResponse
from app.services.streak import calculate_user_streak
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.utils.slug import generate_unique_slug
from app.routes.follows import get_follow_state

# Endpoints here are PUBLIC unless they depend on get_current_user.
# They expose portfolio-style data only (never email or password hashes).
router = APIRouter(prefix="/users", tags=["users"])

# Usernames: 3-30 chars, lowercase letters, digits, underscores.
USERNAME_PATTERN = re.compile(r"^[a-z0-9_]{3,30}$")


def _get_user_or_404(username: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer not found.",
        )
    return user


def _can_view_content(user: User, viewer: Optional[User], db: Session) -> bool:
    """
    Privacy rule (Milestone 10): a private account's content is visible to
    the owner and to accepted followers only. Everyone else sees the wall.
    """
    if user.profile_visibility != "private":
        return True
    if viewer is None:
        return False
    if viewer.id == user.id:
        return True
    is_follower = (
        db.query(Follow)
        .filter(Follow.follower_id == viewer.id, Follow.following_id == user.id)
        .first()
        is not None
    )
    return is_follower


@router.get("/search", response_model=List[dict])
def search_users(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Backend-side developer search by username or display name.
    Results carry the caller's follow state so buttons render correctly.
    """
    q = q.strip()
    if len(q) < 1:
        return []

    pattern = f"%{q}%"
    matches = (
        db.query(User)
        .filter(
            (User.username.ilike(pattern))
            | (User.display_name.ilike(pattern))
        )
        .filter(User.id != current_user.id)
        .order_by(User.username.asc())
        .limit(20)
        .all()
    )

    results = []
    for user in matches:
        results.append({
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "skills": user.skills or [],
            "profile_visibility": user.profile_visibility,
            "follow_state": get_follow_state(db, current_user.id, user),
        })
    return results


@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    """
    Live username availability check for the account setup wizard.
    Must be declared BEFORE /{username} so FastAPI doesn't treat
    'check-username' as a username path parameter.
    """
    username = username.strip().lower()
    if not USERNAME_PATTERN.match(username):
        return {
            "username": username,
            "available": False,
            "reason": "Use 3-30 characters: lowercase letters, numbers, underscores.",
        }

    taken = db.query(User).filter(User.username == username).first()
    if taken:
        return {"username": username, "available": False, "reason": "Username is already taken."}

    return {"username": username, "available": True, "reason": None}


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the authenticated user's own profile (used by /setup and /settings).
    Only provided fields are updated. Changing username re-checks uniqueness.
    """
    if req.username is not None and req.username != current_user.username:
        if not USERNAME_PATTERN.match(req.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username must be 3-30 characters: lowercase letters, numbers, underscores.",
            )
        taken = db.query(User).filter(User.username == req.username).first()
        if taken:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken.",
            )
        current_user.username = req.username

    # Simple pass-through fields (None means "not provided, keep old value")
    update_fields = [
        "display_name", "bio", "college", "branch", "year",
        "avatar_url", "github_url", "linkedin_url", "portfolio_url",
        "profile_visibility", "profile_setup_complete",
    ]
    for field in update_fields:
        value = getattr(req, field)
        if value is not None:
            if isinstance(value, str):
                value = value.strip() or None
            setattr(current_user, field, value)

    if req.skills is not None:
        current_user.skills = [s.strip() for s in req.skills if s.strip()]

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/{username}")
def get_public_profile(username: str, db: Session = Depends(get_db), viewer: Optional[User] = Depends(get_optional_current_user)):
    """
    Public developer profile for /u/{username}.

    For a PRIVATE account viewed by a non-follower, only basic identity is
    returned (is_private=true) — projects, activity and streak are withheld
    and the frontend shows the "This account is private" wall.
    """
    user = _get_user_or_404(username, db)

    follower_count = (
        db.query(Follow).filter(Follow.following_id == user.id).count()
    )
    following_count = (
        db.query(Follow).filter(Follow.follower_id == user.id).count()
    )
    follow_state = get_follow_state(db, viewer.id if viewer else None, user)

    base = {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "bio": user.bio,
        "college": user.college,
        "branch": user.branch,
        "year": user.year,
        "skills": user.skills or [],
        "avatar_url": user.avatar_url,
        "github_url": user.github_url,
        "linkedin_url": user.linkedin_url,
        "portfolio_url": user.portfolio_url,
        "profile_visibility": user.profile_visibility,
        "created_at": user.created_at,
        "follower_count": follower_count,
        "following_count": following_count,
        "follow_state": follow_state,
        "is_private": user.profile_visibility == "private"
        and (viewer is None or viewer.id != user.id)
        and get_follow_state(db, viewer.id if viewer else None, user) != "FOLLOWING",
    }

    # Private wall: withhold all content from non-followers
    if base["is_private"]:
        base.update({
            "current_streak": 0,
            "longest_streak": 0,
            "project_count": 0,
            "log_count": 0,
            "recent_activity": [],
        })
        return base

    streak_info = calculate_user_streak(user.id, db)
    project_count = db.query(Project).filter(Project.user_id == user.id).count()
    log_count = db.query(BuildLog).filter(BuildLog.user_id == user.id).count()

    # 10 most recent logs across all projects, joined with project info
    recent_rows = (
        db.query(BuildLog, Project.name, Project.slug)
        .join(Project, BuildLog.project_id == Project.id)
        .filter(BuildLog.user_id == user.id)
        .order_by(BuildLog.created_at.desc())
        .limit(10)
        .all()
    )

    recent_activity = [
        PublicActivityItem(
            id=log.id,
            project_id=log.project_id,
            project_name=project_name,
            project_slug=project_slug or generate_unique_slug(project_name, db, exclude_project_id=log.project_id),
            built=log.built,
            created_at=log.created_at,
        )
        for log, project_name, project_slug in recent_rows
    ]

    base.update({
        "current_streak": streak_info["current_streak"],
        "longest_streak": streak_info["longest_streak"],
        "project_count": project_count,
        "log_count": log_count,
        "recent_activity": recent_activity,
    })

    # Connected-platform stats (real synced data only, never invented).
    # Hidden on the private wall just like the rest of the content.
    from app.models.integration import GitHubIntegration, LeetCodeIntegration
    integrations: dict = {}
    gh_integration = (
        db.query(GitHubIntegration).filter(GitHubIntegration.user_id == user.id).first()
    )
    if gh_integration and gh_integration.stats_cache:
        integrations["github"] = {
            "username": gh_integration.github_username,
            **gh_integration.stats_cache,
        }
    lc_integration = (
        db.query(LeetCodeIntegration).filter(LeetCodeIntegration.user_id == user.id).first()
    )
    if lc_integration and lc_integration.profile_cache:
        integrations["leetcode"] = {
            "username": lc_integration.leetcode_username,
            **lc_integration.profile_cache,
        }
    if integrations:
        base["integrations"] = integrations

    return base


@router.get("/{username}/projects")
def list_public_projects(
    username: str,
    db: Session = Depends(get_db),
    viewer: Optional[User] = Depends(get_optional_current_user),
):
    """
    List a developer's projects for their public profile.
    Private ACCOUNTS: only accepted followers (or the owner) get results.
    Private PROJECTS: only the owner sees them in the list.
    """
    user = _get_user_or_404(username, db)

    if not _can_view_content(user, viewer, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is private. Follow this developer to view their projects.",
        )

    query = db.query(Project).filter(Project.user_id == user.id)
    if viewer is None or viewer.id != user.id:
        query = query.filter(Project.visibility == "public")

    projects = query.order_by(Project.updated_at.desc()).all()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.get("/{username}/projects/{project_slug}")
def get_public_project(
    username: str,
    project_slug: str,
    db: Session = Depends(get_db),
    viewer: Optional[User] = Depends(get_optional_current_user),
):
    """
    Public shareable project page data for /u/{username}/{project_slug}:
    project details, owner info, and the full build journey (all logs).
    Enforces both account-level and project-level privacy.
    """
    user = _get_user_or_404(username, db)

    if not _can_view_content(user, viewer, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is private. Follow this developer to view their projects.",
        )

    project = (
        db.query(Project)
        .filter(Project.user_id == user.id, Project.slug == project_slug)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found for this developer.",
        )

    # Project-level privacy: only the owner can open a private project
    if project.visibility == "private" and (viewer is None or viewer.id != user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This project is private.",
        )

    logs = (
        db.query(BuildLog)
        .filter(BuildLog.project_id == project.id)
        .order_by(BuildLog.created_at.asc())
        .all()
    )

    return {
        "project": ProjectResponse.model_validate(project),
        "owner": {
            "username": user.username,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
        },
        "logs": [BuildLogResponse.model_validate(log) for log in logs],
    }
