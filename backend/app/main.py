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
    integrations_router,
)

# Import all models to ensure they are registered with SQLAlchemy Base metadata
import app.models  # noqa: F401
import app.integrations  # noqa: F401  (registers integration providers)

# Columns that were added to models after their tables were first created.
# Shape: (table, column, DDL definition usable by both SQLite and PostgreSQL).
# Existing rows keep safe defaults (e.g. source='manual') — never fake data.
SCHEMA_MIGRATIONS: list[tuple[str, str, str]] = [
    ("projects", "slug", "VARCHAR(140) NOT NULL DEFAULT ''"),
    ("projects", "visibility", "VARCHAR(10) NOT NULL DEFAULT 'public'"),
    ("projects", "source", "VARCHAR(20) NOT NULL DEFAULT 'manual'"),
    ("projects", "external_provider", "VARCHAR(30)"),
    ("projects", "external_id", "VARCHAR(100)"),
    ("projects", "stars", "INTEGER NOT NULL DEFAULT 0"),
    ("projects", "forks", "INTEGER NOT NULL DEFAULT 0"),
    ("projects", "last_synced_at", "TIMESTAMP"),
    ("users", "display_name", "VARCHAR(100)"),
    ("users", "bio", "VARCHAR(500)"),
    ("users", "college", "VARCHAR(150)"),
    ("users", "skills", "JSON"),
    ("users", "avatar_url", "VARCHAR(500)"),
    ("users", "branch", "VARCHAR(100)"),
    ("users", "year", "VARCHAR(20)"),
    ("users", "github_url", "VARCHAR(500)"),
    ("users", "linkedin_url", "VARCHAR(500)"),
    ("users", "portfolio_url", "VARCHAR(500)"),
    ("users", "profile_visibility", "VARCHAR(10) NOT NULL DEFAULT 'public'"),
    ("users", "profile_setup_complete", "BOOLEAN NOT NULL DEFAULT FALSE"),
    ("users", "github_id", "INTEGER"),
    ("github_integrations", "stats_cache", "JSON"),
]

# Columns whose addition marks "this database predates onboarding" so
# pre-existing users can be marked setup-complete exactly once.
ONBOARDING_EPOCH_COLUMNS = ("users", "profile_setup_complete")


def _table_columns(conn, dialect: str, table: str) -> set:
    """Existing column names for a table, per dialect."""
    if dialect == "sqlite":
        return {
            row[1]
            for row in conn.execute(text(f"PRAGMA table_info('{table}')")).fetchall()
        }
    return {
        row[0]
        for row in conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = :table_name"
            ),
            {"table_name": table},
        ).fetchall()
    }


def _table_exists(conn, dialect: str, table: str) -> bool:
    if dialect == "sqlite":
        return (
            conn.execute(
                text("SELECT 1 FROM sqlite_master WHERE type='table' AND name=:name"),
                {"name": table},
            ).first()
            is not None
        )
    return (
        conn.execute(
            text(
                "SELECT 1 FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name = :name"
            ),
            {"name": table},
        ).first()
        is not None
    )


def run_startup_migrations() -> None:
    """
    Idempotent, additive schema migration for existing databases.

    Safe to run on every startup and against production data:
    - checks information_schema/PRAGMA FIRST, so no statement can ever fail
      with "column already exists" (in PostgreSQL a failed statement aborts
      the whole transaction, which silently skipped every later ALTER in the
      previous try/except implementation),
    - only ADDS missing columns; never drops columns or deletes rows,
    - leaves NULLable new fields NULL for existing rows (no invented data);
      NOT NULL columns get a default consistent with the model
      (e.g. projects.source stays 'manual' for existing projects).
    """
    dialect = engine.dialect.name
    added_onboarding_columns = False

    with engine.begin() as conn:
        for table, column, definition in SCHEMA_MIGRATIONS:
            if not _table_exists(conn, dialect, table):
                continue  # brand-new tables are created by create_all()
            if column in _table_columns(conn, dialect, table):
                continue  # already migrated — idempotent no-op
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
            if (table, column) == ONBOARDING_EPOCH_COLUMNS:
                added_onboarding_columns = True

        # SQLite never enforced FK cascades before PRAGMA foreign_keys=ON
        # (see database.py) — clean up rows orphaned by deleted users.
        if dialect == "sqlite" and _table_exists(conn, dialect, "external_activities"):
            conn.execute(text("DELETE FROM activities WHERE user_id NOT IN (SELECT id FROM users)"))
            conn.execute(text("DELETE FROM external_activities WHERE user_id NOT IN (SELECT id FROM users)"))

    # Backfill slugs for projects created before slugs existed
    from app.utils.slug import generate_unique_slug
    from app.models.project import Project
    from app.models.user import User

    db = SessionLocal()
    try:
        projects_without_slug = db.query(Project).filter(Project.slug == "").all()
        for project in projects_without_slug:
            project.slug = generate_unique_slug(project.name, db)

        # ONLY on the very first migration that adds onboarding columns:
        # mark pre-existing users as setup-complete (they never saw
        # onboarding). Running this every startup would wrongly "complete"
        # the setup of new real users.
        if added_onboarding_columns:
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
app.include_router(integrations_router, prefix="/api")

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
