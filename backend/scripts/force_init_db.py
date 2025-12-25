# backend/scripts/force_init_db.py
import sys
import os

# Ensure we can import from the app folder
sys.path.append(os.getcwd())

from app.db.session import engine
from app.db.base_class import Base

# --- CRITICAL: Force Import of Models ---
# We print to verify they are loaded
print("🔄 Importing models...")
try:
    from app.models.patient import Patient
    from app.models.user import User
    print("✅ Models imported successfully.")
except ImportError as e:
    print(f"❌ MODEL IMPORT FAILED: {e}")
    sys.exit(1)

def init_db():
    print("------------------------------------------------")
    print(f"🔌 Connecting to: {engine.url}")
    
    # 1. DEBUG: Print what tables SQLAlchemy actually sees
    tables = list(Base.metadata.tables.keys())
    print(f"📋 Tables detected in code: {tables}")
    
    if "patients" not in tables:
        print("❌ ERROR: 'patients' table is missing from metadata. Check model inheritance!")
        return

    # 2. Force Create
    print("🛠  Creating tables now...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created in Neon database!")
    print("------------------------------------------------")

if __name__ == "__main__":
    init_db()