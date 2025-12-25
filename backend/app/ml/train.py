import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text
from prophet import Prophet
import joblib
import os

# Define where to save the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "census_model.joblib")

def train_census_model(db: Session):
    """
    1. Extracts daily counts from SQL.
    2. Trains a Professional-Grade Prophet model (Tuned for Hospitals).
    3. Saves the model to disk with compression.
    """
    print("🧠 Starting Model Training (Professional Mode)...")

    # --- 1. DATA EXTRACTION ---
    # Aggregating by Day is perfect for Census Forecasting
    query = text("""
        SELECT date(admission_date) as ds, count(*) as y 
        FROM patients 
        GROUP BY date(admission_date) 
        ORDER BY date(admission_date) ASC
    """)
    
    result = db.execute(query)
    rows = result.fetchall()

    # We need a bit more data for the "Pro" features to work well
    if len(rows) < 10:
        print("⚠️ Not enough history to train a professional model (Need 10+ days). Skipping.")
        return False

    # Convert to Pandas DataFrame
    df = pd.DataFrame(rows, columns=["ds", "y"])
    df["ds"] = pd.to_datetime(df["ds"])

    print(f"📊 Training on {len(df)} days of history...")

    # --- 2. MODEL CONFIGURATION (The "Pro" Tweaks) ---
    # - weekly_seasonality=True: CRITICAL. Captures the "Weekend Drop" in hospitals.
    # - daily_seasonality=False: CRITICAL. We only have daily data, so 'hourly' patterns don't exist.
    # - changepoint_prior_scale=0.1: Makes the model more "flexible" to catch recent trend changes quickly.
    # - seasonality_mode='additive': Standard for census data (fluctuations are constant size).
    
    model = Prophet(
        growth='linear',
        weekly_seasonality=True,  # Captures Mon-Sun patterns
        daily_seasonality=False,  # DISABLE this (we don't have hourly data)
        yearly_seasonality='auto', # Enable if we have >1 year of data
        changepoint_prior_scale=0.1, # React faster to new trends
        seasonality_mode='additive'
    )

    # Optional: Add Holidays (e.g. Christmas drops census)
    # model.add_country_holidays(country_name='US') 

    model.fit(df)

    # --- 3. SAVE THE BRAIN ---
    # compress=3 makes the file smaller and faster to load
    joblib.dump(model, MODEL_PATH, compress=3)
    print(f"✅ Professional Model saved to: {MODEL_PATH}")
    
    return True