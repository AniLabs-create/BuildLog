from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class UserEntitlement(Base):
    """
    User Entitlements & Subscription Tiers.
    Provides feature flags for free vs. Pro features (AI Portfolio Agent,
    custom styling, original design generation).
    Ready for clean drop-in Stripe replacement later.
    """
    __tablename__ = "user_entitlements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    is_pro = Column(Boolean, default=False, nullable=False)
    tier = Column(String(50), default="free", nullable=False)  # free | pro_demo | pro
    features = Column(JSON, default=dict, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<UserEntitlement user_id={self.user_id} tier='{self.tier}' is_pro={self.is_pro}>"
