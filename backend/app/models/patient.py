from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Index
from app.db.base import Base
from datetime import datetime

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    admission_date = Column(Date)
    condition = Column(String, index=True)
    
    # Vitals stored as individual columns for fast analytics queries
    sys_bp = Column(Integer)
    dia_bp = Column(Integer)
    heart_rate = Column(Integer)
    spo2 = Column(Integer)
    temp = Column(Float)
    bmi = Column(Float)
    
    # ML Outputs
    risk_score = Column(Integer, index=True)
    risk_level = Column(String)
    zone = Column(String, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Composite index for common dashboard filtering
    __table_args__ = (
        Index('idx_zone_risk', 'zone', 'risk_level'),
    )