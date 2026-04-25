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

if create_engine:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
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
