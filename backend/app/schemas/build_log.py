from datetime import datetime
from pydantic import BaseModel, ConfigDict

class BuildLogBase(BaseModel):
    built: str
    learned: str
    problems: str
    next_steps: str

class BuildLogCreate(BuildLogBase):
    pass

class BuildLogResponse(BuildLogBase):
    id: int
    project_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
