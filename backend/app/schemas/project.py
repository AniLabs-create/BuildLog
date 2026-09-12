from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, ConfigDict

ProjectStatusType = Literal['Idea', 'Building', 'Completed', 'Deployed', 'Abandoned']
ProjectVisibilityType = Literal['public', 'private']

class ProjectBase(BaseModel):
    name: str
    description: str
    status: ProjectStatusType = "Idea"
    tech_stack: List[str] = []
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    visibility: ProjectVisibilityType = "public"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    slug: str = ""
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
