from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class BuildLog(Base):
    """
    SQLAlchemy Model for the 'build_logs' table.
    The core unit of BuildLog, storing structured 4-part daily progress updates:
    - built: What was built today
    - learned: What concepts or mechanics were learned
    - problems: What bugs, hurdles, or edge cases were faced
    - next_steps: What needs to be tackled next
    """
    __tablename__ = "build_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    built = Column(Text, nullable=False)
    learned = Column(Text, nullable=False)
    problems = Column(Text, nullable=False)
    next_steps = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="build_logs")
    author = relationship("User", back_populates="build_logs")

    def __repr__(self) -> str:
        return f"<BuildLog id={self.id} project_id={self.project_id} user_id={self.user_id}>"
