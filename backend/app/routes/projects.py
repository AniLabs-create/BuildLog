from typing import List
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.utils.slug import generate_unique_slug
from app.services.activity import record_activity

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all projects belonging to the currently logged-in user.
    """
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [ProjectResponse.model_validate(p) for p in projects]

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new project for the currently logged-in user.
    Also records a 'project_created' activity for the home feed.
    """
    project = Project(
        user_id=current_user.id,
        name=req.name.strip(),
        slug=generate_unique_slug(req.name, db),
        description=req.description.strip(),
        status=req.status,
        tech_stack=req.tech_stack,
        github_url=req.github_url,
        demo_url=req.demo_url,
        visibility=req.visibility,
    )
    db.add(project)
    db.flush()  # assign project.id before referencing it in the activity
    record_activity(db, current_user.id, project.id, "project_created")
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    viewer: Optional[User] = Depends(get_optional_current_user),
):
    """
    Retrieve project details by ID.
    Private projects are only visible to their owner (others get a 404,
    which avoids revealing that a private project exists at all).
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

    return ProjectResponse.model_validate(project)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update an existing project.
    Strictly verifies ownership: users can only modify their own projects.
    Status changes to Completed/Deployed are recorded for the home feed.
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
            detail="You do not have permission to modify this project.",
        )

    # Only regenerate the slug when the name actually changed,
    # so shared URLs stay stable while other fields are edited.
    if project.name != req.name.strip():
        project.slug = generate_unique_slug(req.name, db, exclude_project_id=project.id)

    old_status = project.status
    project.name = req.name.strip()
    project.description = req.description.strip()
    project.status = req.status
    project.tech_stack = req.tech_stack
    project.github_url = req.github_url
    project.demo_url = req.demo_url
    project.visibility = req.visibility
    project.updated_at = datetime.utcnow()

    # Feed-worthy milestones
    if old_status != req.status:
        if req.status == "Completed":
            record_activity(db, current_user.id, project.id, "project_completed")
        elif req.status == "Deployed":
            record_activity(db, current_user.id, project.id, "project_deployed")

    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a project and all associated build logs.
    Strictly verifies ownership.
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
            detail="You do not have permission to delete this project.",
        )

    db.delete(project)
    db.commit()
    return None
