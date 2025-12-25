from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# --- Shared Vitals Schema ---
class Vitals(BaseModel):
    bp: str   # Frontend sends "120/80"
    hr: int
    spo2: int
    temp: float

# --- Base Schema ---
class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    condition: str
    zone: str

# --- Write Schema (Input) ---
class PatientCreate(PatientBase):
    vitals: Vitals
    admissionDate: str # ISO Date string

# --- Read Schema (Output) ---
class Patient(PatientBase):
    id: str
    riskScore: int
    riskLevel: str
    admissionDate: str
    vitals: Vitals

    class Config:
        from_attributes = True

    # Custom Mapper: Converts Flat DB Columns -> Nested Frontend Object
    @classmethod
    def from_orm_custom(cls, obj):
        # Handle cases where vitals might be missing
        bp_str = f"{obj.sys_bp}/{obj.dia_bp}" if obj.sys_bp and obj.dia_bp else "0/0"
        
        return cls(
            id=obj.id,
            name=obj.name,
            age=obj.age,
            gender=obj.gender,
            condition=obj.condition,
            zone=obj.zone,
            riskScore=obj.risk_score or 0,
            riskLevel=obj.risk_level or "Unknown",
            admissionDate=str(obj.admission_date),
            vitals=Vitals(
                bp=bp_str,
                hr=obj.heart_rate or 0,
                spo2=obj.spo2 or 0,
                temp=obj.temp or 0.0
            )
        )