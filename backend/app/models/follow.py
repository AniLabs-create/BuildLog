from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Follow(Base):
    """
    An accepted follow relationship between two users.

    follower_id  = the user who pressed Follow
    following_id = the user being followed

    A proper join table (not an array on the user record) so we can
    query "who follows me" and "who do I follow" efficiently and add
    a database-level guarantee against duplicate rows.
    """
    __tablename__ = "follows"
    __table_args__ = (
        UniqueConstraint("follower_id", "following_id", name="uq_follow_pair"),
    )

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    following_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    follower = relationship("User", foreign_keys=[follower_id])
    following = relationship("User", foreign_keys=[following_id])


class FollowRequest(Base):
    """
    A pending "request to follow" aimed at a PRIVATE account.

    Lives between "pressed Follow" and "accepted": once the target accepts,
    the row is deleted and a Follow row is created instead.
    """
    __tablename__ = "follow_requests"
    __table_args__ = (
        UniqueConstraint("requester_id", "target_id", name="uq_follow_request_pair"),
    )

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    requester = relationship("User", foreign_keys=[requester_id])
