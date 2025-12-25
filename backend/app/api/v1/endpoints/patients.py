from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
import csv
import io
from fastapi.responses import StreamingResponse
from datetime import datetime

from app.db.session import get_db
from app.models.patient import Patient
# Assuming you have schemas defined, otherwise we use dicts/Any
from pydantic import BaseModel

router = APIRouter()

# --- Pydantic Schemas (Inline for safety, ensuring matches Frontend) ---
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    condition: str = "General Checkup"
    # Frontend might send these flat or nested. We'll handle flat input here.
    # If your frontend sends "vitals": {...}, you need a validator or parsing logic.
    # Based on your dashboard, we stick to the core fields.
    sys_bp: int
    dia_bp: int
    heart_rate: int
    spo2: float
    temp: float
    bmi: float
    risk_score: float = 0.0
    risk_level: str = "Low"
    zone: str = "General Ward"

@router.get("/")
def get_patients(
    skip: int = 0,
    limit: int = 50,
    search: str = "",
    risk_level: str = "",
    sort_by: str = "date",
    db: Session = Depends(get_db)
):
    query = db.query(Patient)

    # 1. Search Filter
    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))
    
    # 2. Risk Filter
    if risk_level and risk_level != "All":
        query = query.filter(Patient.risk_level == risk_level)

    # 3. Sorting
    if sort_by == "risk_desc":
        query = query.order_by(desc(Patient.risk_score))
    elif sort_by == "risk_asc":
        query = query.order_by(Patient.risk_score)
    else:
        # Default to newest admissions
        query = query.order_by(desc(Patient.admission_date))

    return query.offset(skip).limit(limit).all()

@router.post("/")
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    """
    FIXED: Explicitly maps input fields to DB columns.
    This prevents the "vitals is invalid keyword" error.
    """
    try:
        # Create unique ID if needed, or let DB handle it if auto-increment
        # Assuming ID is a string like 'PAT-123' based on previous context
        import random
        new_id = f"PAT-{random.randint(1000000, 9999999)}"

        db_patient = Patient(
            id=new_id,
            name=patient_in.name,
            age=patient_in.age,
            gender=patient_in.gender,
            condition=patient_in.condition,
            admission_date=datetime.now(),
            
            # Map Vitals Directly (Flattened)
            sys_bp=patient_in.sys_bp,
            dia_bp=patient_in.dia_bp,
            heart_rate=patient_in.heart_rate,
            spo2=patient_in.spo2,
            temp=patient_in.temp,
            bmi=patient_in.bmi,
            
            # Risk
            risk_score=patient_in.risk_score,
            risk_level=patient_in.risk_level,
            zone=patient_in.zone
        )
        
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient

    except Exception as e:
        print(f"❌ Create Patient Error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export_csv")
def export_patients_csv(db: Session = Depends(get_db)):
    """
    FIXED: Accesses flat columns (p.sys_bp) instead of p.vitals
    """
    try:
        patients = db.query(Patient).limit(1000).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write Headers
        headers = [
            "ID", "Name", "Age", "Gender", "Condition", "Zone", 
            "Admission Date", "Sys BP", "Dia BP", "Heart Rate", 
            "SPO2", "Temp", "BMI", "Risk Score", "Risk Level"
        ]
        writer.writerow(headers)
        
        # Write Rows
        for p in patients:
            writer.writerow([
                p.id,
                p.name,
                p.age,
                p.gender,
                p.condition,
                p.zone,
                p.admission_date,
                # FIX: Access attributes directly
                p.sys_bp, 
                p.dia_bp, 
                p.heart_rate,
                p.spo2,
                p.temp,
                p.bmi,
                p.risk_score,
                p.risk_level
            ])
            
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=patients_export_{datetime.now().strftime('%Y%m%d')}.csv"}
        )

    except Exception as e:
        print(f" Export CSV Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV: {str(e)}")