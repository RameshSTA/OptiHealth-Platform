from typing import Generator
from app.db.session import SessionLocal

def get_db() -> Generator:
    """
    Dependency to get a database session.
    Used by: dashboard.py, ml.py, etc.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()