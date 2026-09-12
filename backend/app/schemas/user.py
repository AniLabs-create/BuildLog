from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, ConfigDict, Field

ProfileVisibilityType = Literal["public", "private"]

class UserBase(BaseModel):
    username: str
    email: EmailStr
    display_name: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    skills: Optional[List[str]] = []
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_visibility: ProfileVisibilityType = "public"
    profile_setup_complete: bool = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProfileUpdateRequest(BaseModel):
    """
    Body for PUT /users/me. Every field is optional so the frontend can
    send only what changed (e.g. just the onboarding wizard's values).
    """
    username: Optional[str] = Field(default=None, min_length=3, max_length=50, pattern=r"^[a-z0-9_]+$")
    display_name: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    college: Optional[str] = Field(default=None, max_length=150)
    branch: Optional[str] = Field(default=None, max_length=100)
    year: Optional[str] = Field(default=None, max_length=20)
    skills: Optional[List[str]] = None
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    github_url: Optional[str] = Field(default=None, max_length=500)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    portfolio_url: Optional[str] = Field(default=None, max_length=500)
    profile_visibility: Optional[ProfileVisibilityType] = None
    profile_setup_complete: Optional[bool] = None


# ---------- Public profile schemas (Milestone 8) ----------
# These schemas expose ONLY public information — never email or password data.

class PublicActivityItem(BaseModel):
    """One recent build-log entry shown on a public profile's activity feed."""
    id: int
    project_id: int
    project_name: str
    project_slug: str
    built: str
    created_at: datetime

class PublicProfileResponse(BaseModel):
    """Public developer portfolio data for /u/{username}."""
    id: int
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    skills: List[str] = []
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_visibility: ProfileVisibilityType = "public"
    created_at: datetime
    current_streak: int
    longest_streak: int
    project_count: int
    log_count: int
    recent_activity: List[PublicActivityItem] = []