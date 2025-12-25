from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import pandas as pd
import joblib
import os
import logging

from app.db.session import get_db
from app.services.analytics_engine import analytics_engine # Keep your existing engine

# --- CONFIGURATION ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# --- LOAD THE BRAIN (Prophet Model) ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "models", "census_model.joblib")

# Load model once at startup to save time
try:
    if os.path.exists(MODEL_PATH):
        census_model = joblib.load(MODEL_PATH)
        logger.info(" Census Forecasting Model Loaded.")
    else:
        census_model = None
        logger.warning("⚠️ No Census Model found. Forecasting will use fallback.")
except Exception as e:
    logger.error(f" Failed to load Census Model: {e}")
    census_model = None


# --- HELPER: New AI Forecast Logic ---
def get_ai_census_forecast(db: Session, days_forecast: int = 7):
    """
    Generates the chart data:
    1. Real History (from SQL)
    2. AI Prediction (from Prophet)
    """
    # 1. Get Real History (Last 30 Days)
    query = text("""
        SELECT date(admission_date) as date, count(*) as count 
        FROM patients 
        GROUP BY date(admission_date) 
        ORDER BY date(admission_date) ASC
    """)
    result = db.execute(query).fetchall()
    
    # Format History
    history_data = [{"date": str(row.date), "count": row.count} for row in result]

    # 2. Generate Prediction
    predicted_data = []
    if census_model:
        try:
            # Create Future Dates
            future_dates = pd.date_range(start=datetime.now(), periods=days_forecast + 1)
            future_df = pd.DataFrame({"ds": future_dates})
            
            # Predict
            forecast = census_model.predict(future_df)
            
            # Format Prediction
            for _, row in forecast.iterrows():
                predicted_data.append({
                    "date": row['ds'].strftime('%Y-%m-%d'),
                    "count": max(0, int(row['yhat'])) # Ensure no negative patients
                })
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            
    return {
        "actual": history_data,
        "predicted": predicted_data
    }


# --- MAIN ENDPOINT ---
@router.get("/")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Aggregates ALL dashboard data into one fast response.
    """
    try:
        # 1. Run the NEW AI Forecast
        census_data = get_ai_census_forecast(db)

        # 2. Run existing analytics for other widgets
        return {
            "kpi": analytics_engine.get_kpi_metrics(db),
            "censusData": census_data, # <--- REPLACED with Prophet Logic
            "populationRisk": analytics_engine.get_population_risk(db), 
            "featureImportance": analytics_engine.get_feature_importance(),
            "readmissionTrend": analytics_engine.get_readmission_trend()
        }

    except Exception as e:
        logger.error(f" Critical Dashboard API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))