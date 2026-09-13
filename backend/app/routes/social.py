"""Social endpoints: Log Stars, comments, suggestions, enriched project detail.

Privacy: star/comment/suggestion routes resolve the target's project (or the
target itself) and enforce the same visibility rules as project reads —
private projects and private accounts only accept activity from the owner
and accepted followers.
"""
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.build_log import BuildLog
from app.models.social import LogStar, Comment, Suggestion
from app.services import social
from app.utils.dependencies import get_current_user, get_optional_current_user

router = APIRouter(tags=["social"])

SUGGESTION_STATUSES = ("Open", "Planned", "Implemented", "Rejected")


def _project_of_target(db: Session, target_type: str, target_id: int) -> Optional[Project]:
    """The project a target belongs to (for privacy enforcement)."""
    if target_type == "project":
        return db.query(Project).filter(Project.id == target_id).first()
    if target_type == "build_log":
        log = db.query(BuildLog).filter(BuildLog.id == target_id).first()
        if not log:
            return None
        return db.query(Project).filter(Project.id == log.project_id).first()
    if target_type == "comment":
        comment = db.query(Comment).filter(Comment.id == target_id).first()
        if not comment:
            return None
        return _project_of_target(db, comment.target_type, comment.target_id)
    if target_type == "suggestion":
        suggestion = db.query(Suggestion).filter(Suggestion.id == target_id).first()
        if not suggestion:
            return None
        return db.query(Project).filter(Project.id == suggestion.project_id).first()
    return None


def _can_view_project(db: Session, project: Project, viewer: Optional[User]) -> bool:
    """Project-level (private repo) + account-level (private profile) privacy."""
    if project.visibility == "private":
        return viewer is not None and viewer.id == project.user_id

    owner = db.query(User).filter(User.id == project.user_id).first()
    if owner is None:
        return False
    if owner.profile_visibility != "private":
        return True
    if viewer is None:
        return False
    if viewer.id == owner.id:
        return True
    from app.models.follow import Follow
    return (
        db.query(Follow)
        .filter(Follow.follower_id == viewer.id, Follow.following_id == owner.id)
        .first()
        is not None
    )


def _require_viewable_project(db: Session, target_type: str, target_id: int, viewer: User) -> Project:
    project = _project_of_target(db, target_type, target_id)
    if project is None or not _can_view_project(db, project, viewer):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Not Found.")
    return project


# ---------- Enriched project detail ----------

def _serialize_suggestion(db: Session, suggestion: Suggestion, viewer: Optional[User]) -> dict:
    author = suggestion.author
    return {
        "id": suggestion.id,
        "content": suggestion.content,
        "status": suggestion.status,
        "created_at": suggestion.created_at.isoformat(),
        "star_count": social.star_count(db, "suggestion", suggestion.id),
        "comment_count": social.comment_count(db, "suggestion", suggestion.id),
        "starred_by_me": (
            social.has_starred(db, viewer.id, "suggestion", suggestion.id) if viewer else False
        ),
        "author": {
            "username": author.username if author else None,
            "display_name": author.display_name if author else None,
            "avatar_url": author.avatar_url if author else None,
        },
    }


@router.get("/projects/{project_id}/detail")
def get_project_detail(
    project_id: int,
    db: Session = Depends(get_db),
    viewer: Optional[User] = Depends(get_optional_current_user),
):
    """
    Everything the project page needs in one response: project (+ README for
    GitHub-sourced repos), Log Star state, build logs with counts, comments,
    and suggestions. Enforces project/account privacy.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Project not found.")
    if not _can_view_project(db, project, viewer):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Project not found.")

    from app.models.build_log import BuildLog as BuildLogModel

    owner = db.query(User).filter(User.id == project.user_id).first()
    logs = (
        db.query(BuildLogModel)
        .filter(BuildLogModel.project_id == project.id)
        .order_by(BuildLogModel.created_at.desc())
        .all()
    )
    comments = (
        db.query(Comment)
        .filter(Comment.target_type == "project", Comment.target_id == project.id)
        .order_by(Comment.created_at.desc())
        .all()
    )
    suggestions = (
        db.query(Suggestion)
        .filter(Suggestion.project_id == project.id)
        .order_by(Suggestion.created_at.desc())
        .all()
    )

    from app.schemas.project import ProjectResponse

    # Serialize in the same camelCase shape the frontend Project type uses
    project_dict = ProjectResponse.model_validate(project).model_dump()
    project_camel = {
        "id": project_dict["id"],
        "userId": project_dict["user_id"],
        "name": project_dict["name"],
        "slug": project_dict["slug"],
        "description": project_dict["description"],
        "status": project_dict["status"],
        "techStack": project_dict["tech_stack"],
        "githubUrl": project_dict["github_url"],
        "demoUrl": project_dict["demo_url"],
        "visibility": project_dict["visibility"],
        "source": project_dict["source"],
        "stars": project_dict["stars"],
        "forks": project_dict["forks"],
        "lastSyncedAt": project_dict["last_synced_at"].isoformat() if project_dict["last_synced_at"] else None,
        "createdAt": project_dict["created_at"].isoformat(),
        "updatedAt": project_dict["updated_at"].isoformat(),
        "readmeContent": project.readme_content,
        "githubOwner": project.github_owner,
    }

    return {
        "project": project_camel,
        "owner": {
            "username": owner.username if owner else None,
            "display_name": owner.display_name if owner else None,
            "avatar_url": owner.avatar_url if owner else None,
        },
        "log_star": {
            "count": social.star_count(db, "project", project.id),
            "starred_by_me": (
                social.has_starred(db, viewer.id, "project", project.id) if viewer else False
            ),
        },
        "logs": [
            {
                "id": log.id,
                "built": log.built,
                "learned": log.learned,
                "problems": log.problems,
                "next_steps": log.next_steps,
                "created_at": log.created_at.isoformat(),
                "star_count": social.star_count(db, "build_log", log.id),
                "starred_by_me": (
                    social.has_starred(db, viewer.id, "build_log", log.id) if viewer else False
                ),
                "comment_count": social.comment_count(db, "build_log", log.id),
            }
            for log in logs
        ],
        "comments": [social.serialize_comment(db, c) for c in comments],
        "suggestions": [
            _serialize_suggestion(db, s, viewer) for s in suggestions
        ],
    }


# ---------- Log Star toggle (project | build_log | comment | suggestion) ----------

class LogStarToggleRequest(BaseModel):
    target_type: str
    target_id: int


@router.post("/log-stars/toggle")
def toggle_log_star(
    req: LogStarToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        if req.target_type not in social.VALID_TARGETS:
            raise ValueError(f"Unknown star target type: {req.target_type}")
        _require_viewable_project(db, req.target_type, req.target_id, current_user)
        result = social.toggle_log_star(db, current_user.id, req.target_type, req.target_id)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
    except LookupError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Target does not exist.")
    return result


# ---------- Comments ----------

class CommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


def _list_comments(db: Session, target_type: str, target_id: int):
    comments = (
        db.query(Comment)
        .filter(Comment.target_type == target_type, Comment.target_id == target_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [social.serialize_comment(db, c) for c in comments]


@router.get("/projects/{project_id}/comments")
def list_project_comments(project_id: int, db: Session = Depends(get_db)):
    return _list_comments(db, "project", project_id)


@router.post("/projects/{project_id}/comments", status_code=status.HTTP_201_CREATED)
def add_project_comment(
    project_id: int,
    req: CommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_viewable_project(db, "project", project_id, current_user)
    try:
        comment = social.add_comment(db, current_user.id, "project", project_id, req.content)
    except LookupError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Project does not exist.")
    return social.serialize_comment(db, comment)


@router.get("/build-logs/{log_id}/comments")
def list_log_comments(log_id: int, db: Session = Depends(get_db)):
    return _list_comments(db, "build_log", log_id)


@router.post("/build-logs/{log_id}/comments", status_code=status.HTTP_201_CREATED)
def add_log_comment(
    log_id: int,
    req: CommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_viewable_project(db, "build_log", log_id, current_user)
    try:
        comment = social.add_comment(db, current_user.id, "build_log", log_id, req.content)
    except LookupError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Build log does not exist.")
    return social.serialize_comment(db, comment)


@router.get("/suggestions/{suggestion_id}/comments")
def list_suggestion_comments(suggestion_id: int, db: Session = Depends(get_db)):
    return _list_comments(db, "suggestion", suggestion_id)


@router.post("/suggestions/{suggestion_id}/comments", status_code=status.HTTP_201_CREATED)
def add_suggestion_comment(
    suggestion_id: int,
    req: CommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_viewable_project(db, "suggestion", suggestion_id, current_user)
    try:
        comment = social.add_comment(db, current_user.id, "suggestion", suggestion_id, req.content)
    except LookupError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Suggestion does not exist.")
    return social.serialize_comment(db, comment)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Author or the project owner may delete a comment."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Comment not found.")
    project = _project_of_target(db, comment.target_type, comment.target_id)
    is_author = comment.user_id == current_user.id
    is_owner = project is not None and project.user_id == current_user.id
    if not (is_author or is_owner):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You cannot delete this comment.")
    db.delete(comment)
    db.commit()
    return {"status": "DELETED"}


# ---------- Suggestions ----------

class SuggestionRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class SuggestionStatusRequest(BaseModel):
    status: str


@router.get("/projects/{project_id}/suggestions")
def list_suggestions(project_id: int, db: Session = Depends(get_db)):
    suggestions = (
        db.query(Suggestion)
        .filter(Suggestion.project_id == project_id)
        .order_by(Suggestion.created_at.desc())
        .all()
    )
    return [_serialize_suggestion(db, s, None) for s in suggestions]


@router.post("/projects/{project_id}/suggestions", status_code=status.HTTP_201_CREATED)
def add_suggestion(
    project_id: int,
    req: SuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_viewable_project(db, "project", project_id, current_user)
    suggestion = Suggestion(
        user_id=current_user.id,
        project_id=project_id,
        content=req.content.strip(),
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return _serialize_suggestion(db, suggestion, current_user)


@router.put("/suggestions/{suggestion_id}/status")
def update_suggestion_status(
    suggestion_id: int,
    req: SuggestionStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Project owner sets the status: Open | Planned | Implemented | Rejected."""
    if req.status not in SUGGESTION_STATUSES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(SUGGESTION_STATUSES)}.",
        )
    suggestion = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Suggestion not found.")
    project = db.query(Project).filter(Project.id == suggestion.project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Only the project owner can set suggestion status.")
    suggestion.status = req.status
    db.commit()
    return _serialize_suggestion(db, suggestion, current_user)


@router.delete("/suggestions/{suggestion_id}", status_code=status.HTTP_200_OK)
def delete_suggestion(
    suggestion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Author or project owner may delete a suggestion."""
    suggestion = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Suggestion not found.")
    project = db.query(Project).filter(Project.id == suggestion.project_id).first()
    is_author = suggestion.user_id == current_user.id
    is_owner = project is not None and project.user_id == current_user.id
    if not (is_author or is_owner):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You cannot delete this suggestion.")
    # remove stars + comments attached to the suggestion
    db.query(LogStar).filter(
        LogStar.target_type == "suggestion", LogStar.target_id == suggestion_id
    ).delete(synchronize_session=False)
    db.query(Comment).filter(
        Comment.target_type == "suggestion", Comment.target_id == suggestion_id
    ).delete(synchronize_session=False)
    db.delete(suggestion)
    db.commit()
    return {"status": "DELETED"}
