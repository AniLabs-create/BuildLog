from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.build_log import BuildLog
from app.models.project import Project
from app.models.user import User
from app.schemas.build_log import BuildLogCreate, BuildLogResponse
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.services.activity import record_activity

# Router for project-scoped logs: /api/projects/{project_id}/logs
project_logs_router = APIRouter(prefix="/projects/{project_id}/logs", tags=["build_logs"])

# Router for direct log actions: /api/logs/{log_id}
logs_router = APIRouter(prefix="/logs", tags=["build_logs"])

@project_logs_router.get("", response_model=List[BuildLogResponse])
def list_project_logs(
    project_id: int,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_optional_current_user),
):
    """
    List all build logs for a given project in reverse chronological order (newest first).
    Private projects are only visible to their owner.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    if project.visibility == "private" and (viewer is None or viewer.id != project.user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    logs = (
        db.query(BuildLog)
        .filter(BuildLog.project_id == project_id)
        .order_by(BuildLog.created_at.desc())
        .all()
    )
    return [BuildLogResponse.model_validate(log) for log in logs]

@project_logs_router.post("", response_model=BuildLogResponse, status_code=status.HTTP_201_CREATED)
def create_build_log(
    project_id: int,
    req: BuildLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new build log for a project.
    Strictly verifies ownership: users can only add logs to their own projects.
    Also records a 'new_build_log' activity for the home feed.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to add logs to this project.",
        )

    log = BuildLog(
        project_id=project_id,
        user_id=current_user.id,
        built=req.built.strip(),
        learned=req.learned.strip(),
        problems=req.problems.strip(),
        next_steps=req.next_steps.strip(),
    )
    db.add(log)
    db.flush()  # assign log.id before referencing it in the activity
    record_activity(db, current_user.id, project_id, "new_build_log", log_id=log.id)
    db.commit()
    db.refresh(log)
    return BuildLogResponse.model_validate(log)

@logs_router.get("/{log_id}", response_model=BuildLogResponse)
def get_build_log(
    log_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve an individual build log by ID.
    """
    log = db.query(BuildLog).filter(BuildLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build log not found.",
        )
    return BuildLogResponse.model_validate(log)

@logs_router.put("/{log_id}", response_model=BuildLogResponse)
def update_build_log(
    log_id: int,
    req: BuildLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update a build log.
    Strictly verifies ownership.
    """
    log = db.query(BuildLog).filter(BuildLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build log not found.",
        )

    if log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this build log.",
        )

    log.built = req.built.strip()
    log.learned = req.learned.strip()
    log.problems = req.problems.strip()
    log.next_steps = req.next_steps.strip()

    db.commit()
    db.refresh(log)
    return BuildLogResponse.model_validate(log)

@logs_router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_build_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a build log.
    Strictly verifies ownership.
    """
    log = db.query(BuildLog).filter(BuildLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build log not found.",
        )

    if log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this build log.",
        )

    db.delete(log)
    db.commit()
    return None
