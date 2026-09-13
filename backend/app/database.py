from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

# Determine database engine arguments
# SQLite requires check_same_thread=False for multithreaded FastAPI requests
connect_args = {}
if settings.normalized_database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Create the database engine
engine = create_engine(
    settings.normalized_database_url,
    connect_args=connect_args,
    echo=settings.DEBUG,  # Log SQL queries in debug mode for learning
)


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    """
    SQLite ignores ON DELETE CASCADE unless foreign keys are enabled per
    connection. Without this, deleting a user would leave orphaned rows.
    """
    if settings.normalized_database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Create a scoped sessionmaker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for all ORM models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session for each incoming request,
    and reliably closes it once the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
