from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.build_log import BuildLog
from app.models.project import Project
from app.models.user import User
from app.services.streak import calculate_user_streak
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])

class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[str] = None

class TimelineItem(BaseModel):
    id: int
    project_id: int
    project_name: str
    project_status: str
    built: str
    learned: str
    problems: str
    next_steps: str
    created_at: str

class DashboardSummaryResponse(BaseModel):
    current_streak: int
    longest_streak: int
    project_count: int
    log_count: int
    recent_activity: List[TimelineItem]

@router.get("/streak", response_model=StreakResponse)
def get_user_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns server-calculated streak statistics for the authenticated user.
    """
    return calculate_user_streak(current_user.id, db)

@router.get("/timeline", response_model=List[TimelineItem])
def get_user_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns unified chronological timeline of all build logs across all projects for the authenticated user.
    """
    logs_with_projects = (
        db.query(BuildLog, Project.name, Project.status)
        .join(Project, BuildLog.project_id == Project.id)
        .filter(BuildLog.user_id == current_user.id)
        .order_by(BuildLog.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        TimelineItem(
            id=log.id,
            project_id=log.project_id,
            project_name=project_name,
            project_status=project_status,
            built=log.built,
            learned=log.learned,
            problems=log.problems,
            next_steps=log.next_steps,
            created_at=log.created_at.isoformat(),
        )
        for log, project_name, project_status in logs_with_projects
    ]

@router.get("/dashboard", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Aggregates dashboard stats in a single fast endpoint:
    - streak metrics
    - project and log counters
    - recent timeline entries
    """
    streak_info = calculate_user_streak(current_user.id, db)
    project_count = db.query(Project).filter(Project.user_id == current_user.id).count()
    log_count = db.query(BuildLog).filter(BuildLog.user_id == current_user.id).count()

    logs_with_projects = (
        db.query(BuildLog, Project.name, Project.status)
        .join(Project, BuildLog.project_id == Project.id)
        .filter(BuildLog.user_id == current_user.id)
        .order_by(BuildLog.created_at.desc())
        .limit(5)
        .all()
    )

    timeline = [
        TimelineItem(
            id=log.id,
            project_id=log.project_id,
            project_name=project_name,
            project_status=project_status,
            built=log.built,
            learned=log.learned,
            problems=log.problems,
            next_steps=log.next_steps,
            created_at=log.created_at.isoformat(),
        )
        for log, project_name, project_status in logs_with_projects
    ]

    return DashboardSummaryResponse(
        current_streak=streak_info["current_streak"],
        longest_streak=streak_info["longest_streak"],
        project_count=project_count,
        log_count=log_count,
        recent_activity=timeline,
    )
