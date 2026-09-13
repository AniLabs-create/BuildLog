from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.follow import Follow
from app.models.activity import Activity
from app.models.build_log import BuildLog
from app.models.project import Project
from app.models.external_activity import ExternalActivity
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/feed", tags=["feed"])

# Human-readable action text per activity type; the rest (actor, project,
# built text) is attached as structured data for the frontend to render.
ACTION_TEXT = {
    "project_created": "started a new project",
    "project_completed": "completed",
    "project_deployed": "deployed",
    "new_build_log": "logged progress on",
}

EXTERNAL_ICONS = {
    "push": "🚀",
    "star": "⭐",
    "create": "📦",
    "release": "🌍",
    "pull_request": "🔀",
    "issue": "🐛",
    "solve": "🧠",
}


@router.get("")
def get_home_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Developer activity feed: newest activities from the current user and
    everyone they follow — BuildLog events AND connected-platform events
    (GitHub pushes, LeetCode solves). Private projects appear as
    "a private project" unless the viewer is the owner.
    """
    following_ids = [
        row[0]
        for row in db.query(Follow.following_id).filter(Follow.follower_id == current_user.id).all()
    ]
    author_ids = [current_user.id] + following_ids

    # ---- BuildLog activities ----
    rows = (
        db.query(Activity, User, Project, BuildLog)
        .join(User, Activity.user_id == User.id)
        .join(Project, Activity.project_id == Project.id)
        .outerjoin(BuildLog, Activity.log_id == BuildLog.id)
        .filter(Activity.user_id.in_(author_ids))
        .order_by(Activity.created_at.desc())
        .limit(50)
        .all()
    )

    items = []
    for activity, actor, project, log in rows:
        is_owner = actor.id == current_user.id
        project_visible = project.visibility == "public" or is_owner

        items.append({
            "id": f"bl-{activity.id}",
            "source": "buildlog",
            "type": activity.type,
            "action_text": ACTION_TEXT.get(activity.type, "updated"),
            "created_at": activity.created_at.isoformat(),
            "actor": {
                "username": actor.username,
                "display_name": actor.display_name,
                "avatar_url": actor.avatar_url,
            },
            "project": {
                "name": project.name if project_visible else "a private project",
                "slug": project.slug if project_visible else None,
                "status": project.status if project_visible else None,
            } if project else None,
            "built_text": log.built if (log and project_visible) else None,
        })

    # ---- External activities (GitHub, LeetCode, ...) ----
    external_rows = (
        db.query(ExternalActivity, User)
        .join(User, ExternalActivity.user_id == User.id)
        .filter(ExternalActivity.user_id.in_(author_ids))
        .order_by(ExternalActivity.occurred_at.desc())
        .limit(50)
        .all()
    )

    for external, actor in external_rows:
        items.append({
            "id": f"ext-{external.id}",
            "source": external.source,
            "type": external.type,
            "action_text": external.title,
            "created_at": external.occurred_at.isoformat(),
            "actor": {
                "username": actor.username,
                "display_name": actor.display_name,
                "avatar_url": actor.avatar_url,
            },
            "project": None,
            "built_text": None,
            "url": external.url,
            "icon": EXTERNAL_ICONS.get(external.type, "🔗"),
        })

    # Merge chronologically, newest first
    items.sort(key=lambda item: item["created_at"], reverse=True)
    return {"items": items[:50]}
