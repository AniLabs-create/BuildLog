from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field

PortfolioStatusType = Literal["draft", "published", "archived"]

class PortfolioProfile(BaseModel):
    name: str = ""
    headline: str = ""
    location: Optional[str] = None
    avatar: Optional[str] = None
    short_bio: str = ""
    long_bio: Optional[str] = None

class PortfolioHero(BaseModel):
    headline: str = "Building the Future with Code"
    subheadline: str = "Full-stack engineer crafting resilient web platforms & AI tools."
    primary_cta_text: str = "View Projects"
    primary_cta_url: str = "#projects"
    secondary_cta_text: Optional[str] = "Get in Touch"
    secondary_cta_url: Optional[str] = "#contact"
    availability_badge: Optional[str] = "Available for hire"

class PortfolioAbout(BaseModel):
    title: str = "About Me"
    content: str = ""
    highlights: List[str] = Field(default_factory=list)

class PortfolioSkill(BaseModel):
    name: str
    category: str = "General"  # Frontend, Backend, AI/ML, DevOps, Tools, etc.
    proficiency: Optional[str] = "Advanced"  # Beginner, Intermediate, Advanced, Expert
    years: Optional[int] = None

class PortfolioExperience(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: str = ""
    end_date: Optional[str] = None
    is_current: bool = False
    description: str = ""
    achievements: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    logo_url: Optional[str] = None

class PortfolioEducation(BaseModel):
    institution: str
    degree: str
    field: str = ""
    start_date: str = ""
    end_date: Optional[str] = None
    grade: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)

class PortfolioProjectItem(BaseModel):
    id: Optional[int] = None
    title: str
    slug: str = ""
    description: str
    problem: Optional[str] = None
    solution: Optional[str] = None
    impact: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    featured: bool = False
    buildlog_project_id: Optional[int] = None

class PortfolioAchievement(BaseModel):
    title: str
    description: str = ""
    date: Optional[str] = None
    organization: Optional[str] = None
    url: Optional[str] = None
    badge: Optional[str] = None

class PortfolioSocialLinks(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None
    email: Optional[str] = None
    twitter: Optional[str] = None
    portfolio: Optional[str] = None
    other: Optional[str] = None

class PortfolioContact(BaseModel):
    email: Optional[str] = None
    cta_title: str = "Let's Build Something Together"
    cta_subtitle: str = "Have a project in mind or want to collaborate? Reach out anytime."
    message_prompt: Optional[str] = "Send me a message"

class PortfolioTheme(BaseModel):
    template_id: str = "minimal"
    primary_color: Optional[str] = "#10b981"
    accent_color: Optional[str] = "#06b6d4"
    background_style: Optional[str] = "dark"
    font_family: Optional[str] = "Inter"
    border_radius: Optional[str] = "rounded-xl"
    animation_level: Optional[str] = "subtle"  # none, subtle, lively
    custom_css: Optional[str] = None

class PortfolioData(BaseModel):
    title: str = "My Developer Portfolio"
    slug: str = ""
    status: PortfolioStatusType = "draft"
    template_id: str = "minimal"
    profile: PortfolioProfile = Field(default_factory=PortfolioProfile)
    hero: PortfolioHero = Field(default_factory=PortfolioHero)
    about: PortfolioAbout = Field(default_factory=PortfolioAbout)
    skills: List[PortfolioSkill] = Field(default_factory=list)
    experience: List[PortfolioExperience] = Field(default_factory=list)
    education: List[PortfolioEducation] = Field(default_factory=list)
    projects: List[PortfolioProjectItem] = Field(default_factory=list)
    achievements: List[PortfolioAchievement] = Field(default_factory=list)
    social_links: PortfolioSocialLinks = Field(default_factory=PortfolioSocialLinks)
    contact: PortfolioContact = Field(default_factory=PortfolioContact)
    theme: PortfolioTheme = Field(default_factory=PortfolioTheme)

class PortfolioCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    slug: Optional[str] = None
    template_id: str = "minimal"
    initial_data: Optional[Dict[str, Any]] = None

class PortfolioUpdateRequest(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    status: Optional[PortfolioStatusType] = None
    template_id: Optional[str] = None
    profile_data: Optional[Dict[str, Any]] = None
    hero_data: Optional[Dict[str, Any]] = None
    about_data: Optional[Dict[str, Any]] = None
    skills_data: Optional[List[Dict[str, Any]]] = None
    experience_data: Optional[List[Dict[str, Any]]] = None
    education_data: Optional[List[Dict[str, Any]]] = None
    projects_data: Optional[List[Dict[str, Any]]] = None
    achievements_data: Optional[List[Dict[str, Any]]] = None
    social_links: Optional[Dict[str, Any]] = None
    contact_data: Optional[Dict[str, Any]] = None
    theme_data: Optional[Dict[str, Any]] = None
    save_version: bool = False
    version_message: Optional[str] = None

class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    title: str
    slug: str
    status: str
    template_id: str
    custom_domain: Optional[str] = None
    profile_data: Dict[str, Any]
    hero_data: Dict[str, Any]
    about_data: Dict[str, Any]
    skills_data: List[Dict[str, Any]]
    experience_data: List[Dict[str, Any]]
    education_data: List[Dict[str, Any]]
    projects_data: List[Dict[str, Any]]
    achievements_data: List[Dict[str, Any]]
    social_links: Dict[str, Any]
    contact_data: Dict[str, Any]
    theme_data: Dict[str, Any]
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PortfolioSummaryResponse(BaseModel):
    id: int
    user_id: int
    title: str
    slug: str
    status: str
    template_id: str
    project_count: int
    skills_count: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PortfolioVersionResponse(BaseModel):
    id: int
    portfolio_id: int
    version_num: int
    message: str
    snapshot: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PublicPortfolioResponse(BaseModel):
    portfolio: PortfolioResponse
    owner: Dict[str, Any]
