import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text
from prophet import Prophet
import joblib
import os
from datetime import datetime

# Define where to save the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "census_model.joblib")

def train_census_model(db: Session):
    print("🧠 Starting Model Training...")

    # 1. Fetch Data
    query = text("""
        SELECT date(admission_date) as ds, count(*) as y 
        FROM patients 
        GROUP BY date(admission_date) 
        ORDER BY date(admission_date) ASC
    """)
    result = db.execute(query)
    rows = result.fetchall()

    if len(rows) < 5:
        print("⚠️ Not enough data to train. Skipping.")
        return False

    df = pd.DataFrame(rows, columns=["ds", "y"])
    df["ds"] = pd.to_datetime(df["ds"])

    # --- CRITICAL FIX: EXCLUDE TODAY ---
    # We remove the current date because incomplete data confuses the AI
    today = pd.Timestamp.now().normalize()
    df = df[df["ds"] < today]

    print(f"📊 Training on {len(df)} days (excluding today)...")

    # 2. Train Model
    # daily_seasonality=False because we don't have hourly data
    model = Prophet(
        growth='linear',
        daily_seasonality=False, 
        weekly_seasonality=True,
        yearly_seasonality=False
    )
    model.fit(df)

    # 3. Save Model
    joblib.dump(model, MODEL_PATH)
    print(f"✅ Model saved to: {MODEL_PATH}")
    return True