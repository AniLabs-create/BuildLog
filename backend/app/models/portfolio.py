from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Portfolio(Base):
    """
    SQLAlchemy Model for the 'portfolios' table.
    Stores complete normalized developer portfolio configurations, themes,
    and modular section data.
    """
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(150), nullable=False, default="My Developer Portfolio")
    slug = Column(String(150), nullable=False, index=True)
    status = Column(String(20), default="draft", nullable=False)  # draft | published | archived
    template_id = Column(String(50), default="minimal", nullable=False)
    custom_domain = Column(String(255), nullable=True)

    # Modular structured sections (JSON for flexible normalized schema)
    profile_data = Column(JSON, default=dict, nullable=False)
    hero_data = Column(JSON, default=dict, nullable=False)
    about_data = Column(JSON, default=dict, nullable=False)
    skills_data = Column(JSON, default=list, nullable=False)
    experience_data = Column(JSON, default=list, nullable=False)
    education_data = Column(JSON, default=list, nullable=False)
    projects_data = Column(JSON, default=list, nullable=False)
    achievements_data = Column(JSON, default=list, nullable=False)
    social_links = Column(JSON, default=dict, nullable=False)
    contact_data = Column(JSON, default=dict, nullable=False)
    theme_data = Column(JSON, default=dict, nullable=False)

    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", foreign_keys=[user_id])
    versions = relationship("PortfolioVersion", back_populates="portfolio", cascade="all, delete-orphan", order_by="desc(PortfolioVersion.created_at)")

    def __repr__(self) -> str:
        return f"<Portfolio id={self.id} user_id={self.user_id} title='{self.title}' status='{self.status}'>"


class PortfolioVersion(Base):
    """
    Snapshot-based version history for non-destructive edits and AI experimentation.
    """
    __tablename__ = "portfolio_versions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    version_num = Column(Integer, nullable=False, default=1)
    message = Column(String(255), default="Saved snapshot", nullable=False)
    snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    portfolio = relationship("Portfolio", back_populates="versions")

    def __repr__(self) -> str:
        return f"<PortfolioVersion id={self.id} portfolio_id={self.portfolio_id} v={self.version_num}>"
