from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    """
    SQLAlchemy Model for the 'users' table.
    Stores user credentials, public developer profile info, and skills.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    # Profile fields (Milestone 5: account setup)
    display_name = Column(String(100), nullable=True)          # Friendly name shown instead of raw username
    bio = Column(String(500), nullable=True)
    college = Column(String(150), nullable=True)
    branch = Column(String(100), nullable=True)                # Course/branch, e.g. "Computer Science"
    year = Column(String(20), nullable=True)                   # Free-text year, e.g. "2nd Year"
    skills = Column(JSON, default=list, nullable=True)         # List of skill strings e.g. ["Python", "FastAPI"]
    avatar_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    # "public" or "private" — private accounts hide content until a follow request is accepted (Milestone 9/10)
    profile_visibility = Column(String(10), default="public", nullable=False)
    # GitHub account link (OAuth). GitHub's numeric user ID is stable even if
    # the username changes, so linking uses this — never just username/email.
    github_id = Column(Integer, unique=True, nullable=True, index=True)
    # False until the user finishes first-time onboarding at /setup
    profile_setup_complete = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    build_logs = relationship("BuildLog", back_populates="author", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} username='{self.username}'>"
