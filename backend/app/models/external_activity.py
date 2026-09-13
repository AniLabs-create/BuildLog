from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, UniqueConstraint

from app.database import Base


class ExternalActivity(Base):
    """
    One normalized activity event from a connected external platform
    (GitHub push/star/release, LeetCode solved problem, ...).

    Deliberately separate from the internal `activities` table: internal
    events are always tied to a BuildLog project, while external events
    reference an outside system and may exist without any project.

    Deduplication: (user_id, source, external_id) is unique — syncing the
    same GitHub event or LeetCode submission twice is a no-op.
    """
    __tablename__ = "external_activities"
    __table_args__ = (
        UniqueConstraint("user_id", "source", "external_id", name="uq_external_activity"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    source = Column(String(30), nullable=False)        # github | leetcode | ...
    type = Column(String(40), nullable=False)          # push | star | release | solve | ...
    external_id = Column(String(120), nullable=False)  # provider's stable event id

    repository = Column(String(200), nullable=True)    # e.g. "owner/repo"
    title = Column(Text, nullable=False)               # human-readable, e.g. 'Solved "Two Sum"'
    url = Column(String(500), nullable=True)           # link to the external item

    occurred_at = Column(DateTime, nullable=False, index=True)
    payload = Column("metadata", JSON, nullable=True)  # extra provider data

    def __repr__(self) -> str:
        return f"<ExternalActivity {self.source}/{self.type} user={self.user_id}>"
