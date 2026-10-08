"""User Entitlement & Feature Flag Service.

Manages Free vs. Pro tier capabilities (AI Portfolio Agent, AI rewriting,
AI redesign, advanced styles).
Implements a development dummy paywall toggle ready for Stripe drop-in.
"""
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.entitlement import UserEntitlement


def get_user_entitlement(user_id: int, db: Session) -> UserEntitlement:
    """Retrieve or initialize the entitlement row for a given user."""
    entitlement = db.query(UserEntitlement).filter(UserEntitlement.user_id == user_id).first()
    if not entitlement:
        entitlement = UserEntitlement(
            user_id=user_id,
            is_pro=False,
            tier="free",
            features=_build_features_dict(False),
        )
        db.add(entitlement)
        db.commit()
        db.refresh(entitlement)
    return entitlement


def _build_features_dict(is_pro: bool) -> Dict[str, bool]:
    """Generates feature map given subscription status."""
    return {
        "portfolio_basic": True,
        "portfolio_templates": True,
        "portfolio_import": True,
        "portfolio_publish": True,
        "portfolio_ai": is_pro,
        "portfolio_ai_rewriting": is_pro,
        "portfolio_ai_redesign": is_pro,
        "portfolio_custom_domain": is_pro,
    }


def update_user_entitlement(user_id: int, is_pro: bool, tier: str, db: Session) -> UserEntitlement:
    """Toggle demo pro or update subscription tier."""
    entitlement = get_user_entitlement(user_id, db)
    entitlement.is_pro = is_pro
    entitlement.tier = tier
    entitlement.features = _build_features_dict(is_pro)
    db.commit()
    db.refresh(entitlement)
    return entitlement


def check_can_use_ai(user_id: int, db: Session) -> bool:
    """Checks if the user has access to Portfolio AI features."""
    entitlement = get_user_entitlement(user_id, db)
    return bool(entitlement.is_pro)
