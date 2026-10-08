"""Backend business logic services package"""
from app.services.streak import calculate_user_streak
from app.services.activity import record_activity
from app.services.portfolio_intelligence import build_portfolio_from_buildlog, calculate_project_score
from app.services.entitlements import get_user_entitlement, update_user_entitlement, check_can_use_ai
from app.services.ai_portfolio_agent import process_portfolio_ai_request, apply_action_to_portfolio

__all__ = [
    "calculate_user_streak",
    "record_activity",
    "build_portfolio_from_buildlog",
    "calculate_project_score",
    "get_user_entitlement",
    "update_user_entitlement",
    "check_can_use_ai",
    "process_portfolio_ai_request",
    "apply_action_to_portfolio",
]
