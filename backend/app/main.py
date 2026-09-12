from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.routes import (
    health_router,
    auth_router,
    projects_router,
    project_logs_router,
    logs_router,
    stats_router,
    users_router,
    follows_router,
    follow_requests_router,
    notifications_router,
    feed_router,
)

# Import all models to ensure they are registered with SQLAlchemy Base metadata
import app.models  # noqa: F401

def run_startup_migrations() -> None:
    """
    Lightweight development-phase migrations.

    SQLAlchemy's create_all() only creates MISSING tables — it never alters
    existing ones. Before a real migration tool (like Alembic) is introduced,
    we patch the schema manually here so already-created dev databases
    (e.g. the local SQLite file) gain new columns without being deleted.
    """
    added_profile_columns = False
    with engine.begin() as conn:
        # Add the project 'slug' column if it does not exist yet
        if engine.dialect.name == "sqlite":
            has_slug = conn.execute(
                text("SELECT 1 FROM pragma_table_info('projects') WHERE name='slug'")
            ).first()
            if not has_slug:
                conn.execute(
                    text("ALTER TABLE projects ADD COLUMN slug VARCHAR(140) NOT NULL DEFAULT ''")
                )

            # Milestone 9: project visibility (public/private)
            project_cols = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info('projects')")).fetchall()
            }
            if "visibility" not in project_cols:
                conn.execute(
                    text("ALTER TABLE projects ADD COLUMN visibility VARCHAR(10) NOT NULL DEFAULT 'public'")
                )

            # Milestone 5: profile columns for account setup
            existing = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info('users')")).fetchall()
            }
            user_columns = {
                "display_name": "VARCHAR(100)",
                "branch": "VARCHAR(100)",
                "year": "VARCHAR(20)",
                "github_url": "VARCHAR(500)",
                "linkedin_url": "VARCHAR(500)",
                "portfolio_url": "VARCHAR(500)",
                "profile_visibility": "VARCHAR(10) NOT NULL DEFAULT 'public'",
                "profile_setup_complete": "BOOLEAN NOT NULL DEFAULT 0",
            }
            for column, definition in user_columns.items():
                if column not in existing:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {column} {definition}"))
                    added_profile_columns = True
        else:
            # PostgreSQL: let the database raise if the column already exists
            try:
                conn.execute(
                    text("ALTER TABLE projects ADD COLUMN slug VARCHAR(140) NOT NULL DEFAULT ''")
                )
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN profile_setup_complete BOOLEAN NOT NULL DEFAULT FALSE")
                )
                conn.execute(
                    text("ALTER TABLE projects ADD COLUMN visibility VARCHAR(10) NOT NULL DEFAULT 'public'")
                )
                added_profile_columns = True
            except Exception:
                pass

    # Backfill slugs for projects created before slugs existed
    from app.utils.slug import generate_unique_slug
    from app.models.project import Project
    from app.models.user import User

    db = SessionLocal()
    try:
        projects_without_slug = db.query(Project).filter(Project.slug == "").all()
        for project in projects_without_slug:
            project.slug = generate_unique_slug(project.name, db)

        # Milestone 5: ONLY on the very first run that adds these columns,
        # mark pre-existing users as setup-complete (they never saw onboarding)
        # and default their display name to the username. Running this every
        # startup would wrongly "complete" the setup of new real users.
        if added_profile_columns:
            existing_users = db.query(User).filter(User.display_name.is_(None)).all()
            for user in existing_users:
                user.display_name = user.username
                user.profile_setup_complete = True
        db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Runs on startup to initialize database tables,
    and runs on shutdown for clean resource deallocation.
    """
    Base.metadata.create_all(bind=engine)
    run_startup_migrations()
    yield

# Instantiate FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="BuildLog Backend REST API — Track what you build, what you learn, and how you grow.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure Cross-Origin Resource Sharing (CORS)
# Allows the React Vite frontend (running on localhost:5173) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(health_router)
app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(project_logs_router, prefix="/api")
app.include_router(logs_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(follows_router, prefix="/api")
app.include_router(follow_requests_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(feed_router, prefix="/api")

@app.get("/", tags=["root"])
def root():
    """Root endpoint welcoming developers to the BuildLog API."""
    return {
        "message": "Welcome to the BuildLog API",
        "tagline": "GitHub shows what you shipped. BuildLog shows how you grew.",
        "docs": "/docs",
        "health": "/api/health",
        "version": "1.0.0",
    }
