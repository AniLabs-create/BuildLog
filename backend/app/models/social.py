from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class LogStar(Base):
    """
    BuildLog's own "Log Star" reaction — one row per user per target.

    Polymorphic by design so one table serves every starable thing:
      target_type: 'project' | 'build_log' | 'comment' | 'suggestion'
      target_id:   that row's id

    Completely separate from GitHub stars (which are synced numbers on
    Project rows). Unique constraint makes duplicate stars impossible.
    """
    __tablename__ = "log_stars"
    __table_args__ = (
        UniqueConstraint("user_id", "target_type", "target_id", name="uq_log_star"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = Column(String(20), nullable=False)
    target_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Comment(Base):
    """
    A comment on a project, build log, or suggestion (same polymorphic
    target shape as LogStar). Authors and project owners can delete comments.
    """
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = Column(String(20), nullable=False)
    target_id = Column(Integer, nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    author = relationship("User", foreign_keys=[user_id])


class Suggestion(Base):
    """
    A user-submitted suggestion on a project ("Add GitHub Actions for
    automatic deployment"). The project owner manages the status.
    """
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    # Open | Planned | Implemented | Rejected (owner-controlled)
    status = Column(String(20), default="Open", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    author = relationship("User", foreign_keys=[user_id])
