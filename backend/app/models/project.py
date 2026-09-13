from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Project(Base):
    """
    SQLAlchemy Model for the 'projects' table.
    Tracks a developer's project, its status, tech stack, and external links.
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    # URL-friendly identifier used on public pages: /u/{username}/{slug}
    slug = Column(String(140), nullable=False, default="", index=True)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="Idea", nullable=False)  # Idea, Building, Completed, Deployed, Abandoned
    # "public" or "private" — private projects are visible to the owner only (V1)
    visibility = Column(String(10), default="public", nullable=False)
    # Integration sync identity: where this project came from and how to
    # match it against the external source on re-sync (GitHub repo ID).
    source = Column(String(20), default="manual", nullable=False)  # manual | github
    external_provider = Column(String(30), nullable=True)          # github
    external_id = Column(String(100), nullable=True, index=True)   # e.g. GitHub repo ID
    stars = Column(Integer, default=0, nullable=False)
    forks = Column(Integer, default=0, nullable=False)
    last_synced_at = Column(DateTime, nullable=True)
    tech_stack = Column(JSON, default=list, nullable=False)       # List of strings e.g. ["Python", "FastAPI", "React"]
    github_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="projects")
    build_logs = relationship("BuildLog", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Project id={self.id} name='{self.name}' status='{self.status}'>"
