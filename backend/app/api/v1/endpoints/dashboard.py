from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_engine import analytics_engine

router = APIRouter()

@router.get("/")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    try:
        return {
            "kpi": analytics_engine.get_kpi_metrics(db),
            "censusData": analytics_engine.generate_census_forecast(db),
            "populationRisk": analytics_engine.get_population_risk(db), # Full DB aggregation
            "featureImportance": analytics_engine.get_feature_importance(), # Real AI features
            "readmissionTrend": analytics_engine.get_readmission_trend()
        }
    except Exception as e:
        print(f"❌ Critical Dashboard API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))