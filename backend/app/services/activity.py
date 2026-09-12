"""Server-side helper for writing feed activities.

Called from the project and build-log routes whenever something
feed-worthy happens, so the feed is an event log rather than a guess.
"""
from sqlalchemy.orm import Session

from app.models.activity import Activity


def record_activity(
    db: Session,
    user_id: int,
    project_id: int,
    activity_type: str,
    log_id: int | None = None,
) -> None:
    db.add(Activity(user_id=user_id, project_id=project_id, type=activity_type, log_id=log_id))
    # NOTE: no commit here — the caller commits its own transaction,
    # so the activity is written atomically with the action that caused it.
