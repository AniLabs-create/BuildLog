from typing import Generator
from sqlalchemy import create_engine
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
