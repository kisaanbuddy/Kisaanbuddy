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
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))

# Render / Heroku return bare  postgresql://  or  postgres://  connection strings.
# SQLAlchemy ≥ 2.0 maps those to the psycopg3 dialect automatically.  Force
# psycopg2 so we never hit "ModuleNotFoundError: No module named 'psycopg'".
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgres://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]


if create_engine:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=DB_POOL_SIZE,
            max_overflow=DB_MAX_OVERFLOW,
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
