# backend/scripts/init_db.py
import logging
from app.db.session import engine
from app.db.base_class import Base

# *** IMPORT ALL MODELS HERE ***
# This is crucial! If you don't import them, SQLAlchemy won't see them.
from app.models.patient import Patient
from app.models.user import User 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating database tables...")
    try:
        # This line looks at all imported models and creates tables in Neon
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tables created successfully!")
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    init_db()