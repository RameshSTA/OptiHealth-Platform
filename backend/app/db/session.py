from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings  # <--- Import your settings

# 1. Use the URL from config.py (which reads .env)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

print(f" Connecting to Database: {SQLALCHEMY_DATABASE_URL}")

# 2. Configure Engine based on DB Type
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True  # vital for Postgres reliability
    )

# 3. Create Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()