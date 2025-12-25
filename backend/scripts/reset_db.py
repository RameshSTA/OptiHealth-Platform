import sys
import os
from sqlalchemy import text

# --- Setup Paths ---
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal

def reset_patients_table():
    print("🗑️  Cleaning 'patients' table...")
    db = SessionLocal()
    try:
        # TRUNCATE is faster than DELETE and resets the table completely
        # We use CASCADE just in case there are future dependencies, though none exist now.
        db.execute(text("TRUNCATE TABLE patients CASCADE;"))
        db.commit()
        print("✅ 'patients' table has been successfully cleared.")
    except Exception as e:
        print(f"❌ Error resetting table: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_patients_table()