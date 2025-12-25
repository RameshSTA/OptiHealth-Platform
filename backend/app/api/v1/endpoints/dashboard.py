from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import pandas as pd
import joblib
import os
import logging

from app.db.session import get_db
from app.services.analytics_engine import analytics_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# --- MODEL PATH ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "models", "census_model.joblib")

def get_ai_census_forecast(db: Session, days_forecast: int = 7):
    # 1. Get Real History
    query = text("""
        SELECT date(admission_date) as date, count(*) as count 
        FROM patients 
        GROUP BY date(admission_date) 
        ORDER BY date(admission_date) ASC
    """)
    result = db.execute(query).fetchall()
    history_data = [{"date": str(row.date), "count": row.count} for row in result]

    # 2. Generate Prediction (Safety Wrapped)
    predicted_data = []
    try:
        if os.path.exists(MODEL_PATH):
            # Load model FRESH on every request to avoid "restart needed" issues
            census_model = joblib.load(MODEL_PATH)
            
            future_dates = pd.date_range(start=datetime.now(), periods=days_forecast + 1)
            future_df = pd.DataFrame({"ds": future_dates})
            
            forecast = census_model.predict(future_df)
            
            for _, row in forecast.iterrows():
                predicted_data.append({
                    "date": row['ds'].strftime('%Y-%m-%d'),
                    "count": max(0, int(row['yhat']))
                })
        else:
            logger.warning("⚠️ Model file not found. Please trigger training.")
    except Exception as e:
        logger.error(f"⚠️ Forecasting error (showing history only): {e}")

    return {
        "actual": history_data,
        "predicted": predicted_data
    }

@router.get("/")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    try:
        return {
            "kpi": analytics_engine.get_kpi_metrics(db),
            "censusData": get_ai_census_forecast(db), # Uses the new Safe Logic
            "populationRisk": analytics_engine.get_population_risk(db),
            "featureImportance": analytics_engine.get_feature_importance(),
            "readmissionTrend": analytics_engine.get_readmission_trend()
        }
    except Exception as e:
        logger.error(f"❌ Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))