from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _serialize(notification: Notification, actor: User) -> dict:
    # Human-readable text lives server-side so frontend stays a dumb renderer
    texts = {
        "follow_request": "requested to follow you.",
        "follow_accepted": "accepted your follow request.",
        "new_follower": "started following you.",
        "project_star": "🔥 Log Starred your project.",
        "build_log_star": "🔥 Log Starred your build log.",
        "comment_star": "🔥 Log Starred your comment.",
        "suggestion_star": "🔥 Log Starred your suggestion.",
        "project_comment": "commented on your project.",
        "build_log_comment": "commented on your build log.",
        "suggestion_comment": "commented on your suggestion.",
    }
    return {
        "id": notification.id,
        "type": notification.type,
        "text": texts.get(notification.type, "sent you a notification."),
        "read": notification.read,
        "created_at": notification.created_at.isoformat(),
        "actor": {
            "username": actor.username,
            "display_name": actor.display_name,
            "avatar_url": actor.avatar_url,
        },
    }


@router.get("")
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """The current user's notifications, newest first, plus an unread counter."""
    rows = (
        db.query(Notification, User)
        .join(User, Notification.actor_id == User.id)
        .filter(Notification.recipient_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )

    unread = (
        db.query(Notification)
        .filter(Notification.recipient_id == current_user.id, Notification.read == False)  # noqa: E712
        .count()
    )

    return {
        "items": [_serialize(notification, actor) for notification, actor in rows],
        "unread_count": unread,
    }


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark one notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    if notification.recipient_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="This notification is not yours.")

    notification.read = True
    db.commit()
    return {"status": "READ"}


@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark every notification as read."""
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.read == False,  # noqa: E712
    ).update({"read": True})
    db.commit()
    return {"status": "ALL_READ"}
