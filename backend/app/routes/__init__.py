from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.build_logs import project_logs_router, logs_router
from app.routes.stats import router as stats_router
from app.routes.users import router as users_router
from app.routes.follows import router as follows_router, requests_router as follow_requests_router
from app.routes.notifications import router as notifications_router
from app.routes.feed import router as feed_router
from app.routes.integrations import router as integrations_router

__all__ = [
    "health_router",
    "auth_router",
    "projects_router",
    "project_logs_router",
    "logs_router",
    "stats_router",
    "users_router",
    "follows_router",
    "follow_requests_router",
    "notifications_router",
    "feed_router",
    "integrations_router",
]
