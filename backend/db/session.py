"""SQLAlchemy session factory.

Defaults to SQLite for local dev. Set DATABASE_URL in .env to switch to Postgres, e.g.
    DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/krishiai
"""
from typing import Generator
import os

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, declarative_base, Session
except ImportError:  # SQLAlchemy is optional until a real DB is wired up
    create_engine = None  # type: ignore
    sessionmaker = None  # type: ignore
    declarative_base = None  # type: ignore
    Session = None  # type: ignore


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./krishiai.db")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "20"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))

if ENVIRONMENT == "production" and DATABASE_URL.startswith("sqlite"):
    raise RuntimeError(
        "Production environment detected, but DATABASE_URL is set to SQLite. "
        "PostgreSQL (postgresql+psycopg2://...) is required for production."
    )

if create_engine:
    if DATABASE_URL.startswith("sqlite"):
        from sqlalchemy import event
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
        )
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.close()
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=DB_POOL_SIZE,
            max_overflow=DB_MAX_OVERFLOW,
            pool_recycle=DB_POOL_RECYCLE,
        )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
else:
    engine = None
    SessionLocal = None
    Base = object  # type: ignore


def get_db() -> Generator:
    """FastAPI dependency — yields a DB session and closes it afterwards."""
    if SessionLocal is None:
        raise RuntimeError("SQLAlchemy not installed. Add sqlalchemy to requirements.txt.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
