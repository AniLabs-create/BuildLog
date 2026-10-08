from typing import Dict, Any
from pydantic import BaseModel, ConfigDict


class EntitlementResponse(BaseModel):
    is_pro: bool
    tier: str  # "free" | "pro_demo" | "pro"
    features: Dict[str, bool]

    model_config = ConfigDict(from_attributes=True)


class EntitlementUpdateRequest(BaseModel):
    is_pro: bool
    tier: str = "pro_demo"
