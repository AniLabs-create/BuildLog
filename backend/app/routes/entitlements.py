"""User Entitlement and Subscription Tier Routes.
Provides feature flag checks and demo Pro toggles.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.entitlement import EntitlementResponse, EntitlementUpdateRequest
from app.utils.dependencies import get_current_user
from app.services.entitlements import get_user_entitlement, update_user_entitlement

router = APIRouter(prefix="/entitlements", tags=["entitlements"])


@router.get("", response_model=EntitlementResponse)
def get_my_entitlement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve current user's entitlement tier and active feature flags."""
    entitlement = get_user_entitlement(current_user.id, db)
    return EntitlementResponse(
        is_pro=entitlement.is_pro,
        tier=entitlement.tier,
        features=entitlement.features or {},
    )


@router.post("/demo-toggle", response_model=EntitlementResponse)
def toggle_demo_pro(
    req: EntitlementUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Toggle development Demo Pro entitlement for testing AI and Pro features.
    """
    tier = req.tier if req.is_pro else "free"
    entitlement = update_user_entitlement(current_user.id, is_pro=req.is_pro, tier=tier, db=db)
    return EntitlementResponse(
        is_pro=entitlement.is_pro,
        tier=entitlement.tier,
        features=entitlement.features or {},
    )
