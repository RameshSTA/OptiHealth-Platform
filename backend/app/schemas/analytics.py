import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.patient import Patient
from datetime import datetime, timedelta

class AnalyticsEngine:
    def get_kpi_metrics(self, db: Session):
        try:
            total_patients = db.query(func.count(Patient.id)).scalar() or 0
            # Mock stats for demo purposes
            return {
                "activePatients": total_patients,
                "readmissionRate": 14.2, 
                "avgLos": 4.5,
                "virtualBedUtilization": 85
            }
        except Exception as e:
            print(f"KPI Error: {e}")
            return {"activePatients": 0, "readmissionRate": 0, "avgLos": 0, "virtualBedUtilization": 0}

    def generate_census_forecast(self, db: Session):
        # Returns mock data for the Area Chart
        return [
            {"time": "Jan", "actual": 400, "predicted": 410, "capacity": 500},
            {"time": "Feb", "actual": 420, "predicted": 430, "capacity": 500},
            {"time": "Mar", "actual": 450, "predicted": 440, "capacity": 500},
            {"time": "Apr", "actual": None, "predicted": 460, "capacity": 500},
            {"time": "May", "actual": None, "predicted": 480, "capacity": 500},
        ]

    def get_feature_importance(self):
        # Populates the "Top Risk Drivers" chart
        return [
            {"feature": "Age > 65", "importance": 0.35},
            {"feature": "Prior Admits", "importance": 0.28},
            {"feature": "High Systolic BP", "importance": 0.15},
            {"feature": "Diabetes", "importance": 0.12},
            {"feature": "Low SpO2", "importance": 0.08},
            {"feature": "High BMI", "importance": 0.02}
        ]

    # --- THIS FUNCTION WAS MISSING IN YOUR FILE ---
    def get_readmission_trend(self):
        # Populates the "Readmission Reduction" chart
         return [
            {"month": "Jan", "rate": 14.5},
            {"month": "Feb", "rate": 13.8},
            {"month": "Mar", "rate": 13.2},
            {"month": "Apr", "rate": 12.5},
            {"month": "May", "rate": 11.0},
            {"month": "Jun", "rate": 9.5}
        ]

analytics_engine = AnalyticsEngine()