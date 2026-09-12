from pydantic import BaseModel

class HealthResponse(BaseModel):
    """Schema returned by the /health endpoint."""
    status: str
    environment: str
    database: str
    version: str

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
