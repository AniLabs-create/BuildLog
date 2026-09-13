"""Log Star + comments + suggestions business logic.

Log Star rules:
- One star per user per target (DB unique constraint is the final gate).
- Toggling removes the star; counts always come from COUNT(*) queries.
- Users are never notified about their own actions.
"""
from typing import Any, Dict

from sqlalchemy.orm import Session

from app.models.social import LogStar, Comment, Suggestion
from app.models.project import Project
from app.models.build_log import BuildLog
from app.models.notification import Notification

VALID_TARGETS = ("project", "build_log", "comment", "suggestion")

# target_type -> (model, owner attribute)
TARGET_MODELS = {
    "project": Project,
    "build_log": BuildLog,
    "comment": Comment,
    "suggestion": Suggestion,
}

NOTIFICATION_TYPES = {
    ("project", "star"): "project_star",
    ("build_log", "star"): "build_log_star",
    ("comment", "star"): "comment_star",
    ("suggestion", "star"): "suggestion_star",
    ("project", "comment"): "project_comment",
    ("build_log", "comment"): "build_log_comment",
    ("suggestion", "comment"): "suggestion_comment",
}


def star_count(db: Session, target_type: str, target_id: int) -> int:
    return (
        db.query(LogStar)
        .filter(LogStar.target_type == target_type, LogStar.target_id == target_id)
        .count()
    )


def comment_count(db: Session, target_type: str, target_id: int) -> int:
    return (
        db.query(Comment)
        .filter(Comment.target_type == target_type, Comment.target_id == target_id)
        .count()
    )


def has_starred(db: Session, user_id: int, target_type: str, target_id: int) -> bool:
    return (
        db.query(LogStar)
        .filter(
            LogStar.user_id == user_id,
            LogStar.target_type == target_type,
            LogStar.target_id == target_id,
        )
        .first()
        is not None
    )


def get_target(db: Session, target_type: str, target_id: int):
    model = TARGET_MODELS.get(target_type)
    if model is None:
        raise ValueError(f"Unknown star target type: {target_type}")
    return db.query(model).filter(model.id == target_id).first()


def _target_owner_id(db: Session, target_type: str, target) -> int:
    """The user who should be notified about activity on this target."""
    if target_type == "project":
        return target.user_id
    if target_type == "build_log":
        return target.user_id
    # comment / suggestion: notify the author
    return target.user_id


def toggle_log_star(db: Session, user_id: int, target_type: str, target_id: int) -> Dict[str, Any]:
    """Toggle the user's Log Star on a target. Returns the new state + count."""
    if target_type not in VALID_TARGETS:
        raise ValueError(f"Unknown star target type: {target_type}")

    target = get_target(db, target_type, target_id)
    if target is None:
        raise LookupError("Target does not exist.")

    existing = (
        db.query(LogStar)
        .filter(
            LogStar.user_id == user_id,
            LogStar.target_type == target_type,
            LogStar.target_id == target_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        starred = False
    else:
        db.add(LogStar(user_id=user_id, target_type=target_type, target_id=target_id))
        starred = True

    owner_id = _target_owner_id(db, target_type, target)
    if starred and owner_id != user_id:
        notification_type = NOTIFICATION_TYPES.get((target_type, "star"))
        if notification_type:
            db.add(Notification(
                recipient_id=owner_id,
                actor_id=user_id,
                type=notification_type,
            ))

    db.commit()
    return {"starred": starred, "count": star_count(db, target_type, target_id)}


def add_comment(
    db: Session,
    user_id: int,
    target_type: str,
    target_id: int,
    content: str,
) -> Comment:
    if target_type not in VALID_TARGETS:
        raise ValueError(f"Unknown comment target type: {target_type}")

    target = get_target(db, target_type, target_id)
    if target is None:
        raise LookupError("Target does not exist.")

    comment = Comment(
        user_id=user_id,
        target_type=target_type,
        target_id=target_id,
        content=content.strip(),
    )
    db.add(comment)

    owner_id = _target_owner_id(db, target_type, target)
    if owner_id != user_id:
        notification_type = NOTIFICATION_TYPES.get((target_type, "comment"))
        if notification_type:
            db.add(Notification(
                recipient_id=owner_id,
                actor_id=user_id,
                type=notification_type,
            ))

    db.commit()
    db.refresh(comment)
    return comment


def serialize_comment(db: Session, comment: Comment) -> dict:
    author = comment.author
    return {
        "id": comment.id,
        "target_type": comment.target_type,
        "target_id": comment.target_id,
        "content": comment.content,
        "created_at": comment.created_at.isoformat(),
        "star_count": star_count(db, "comment", comment.id),
        "author": {
            "username": author.username if author else None,
            "display_name": author.display_name if author else None,
            "avatar_url": author.avatar_url if author else None,
        },
    }
