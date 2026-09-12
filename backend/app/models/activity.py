from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Activity(Base):
    """
    One feed-worthy event, written by the backend when it happens:
      - 'project_created'  : user started a new project
      - 'project_completed': status changed to Completed
      - 'project_deployed' : status changed to Deployed
      - 'new_build_log'    : user wrote a build log (log_id links to it)

    The home feed is simply the newest activities from the current user
    plus everyone they follow.
    """
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    log_id = Column(Integer, ForeignKey("build_logs.id", ondelete="CASCADE"), nullable=True)
    type = Column(String(30), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    actor = relationship("User", foreign_keys=[user_id])
    project = relationship("Project", foreign_keys=[project_id])
