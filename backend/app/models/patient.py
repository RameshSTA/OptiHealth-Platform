from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from datetime import datetime
from app.db.base_class import Base  # <--- MUST MATCH User model's import

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    admission_date = Column(DateTime, default=datetime.utcnow)
    condition = Column(String, nullable=True)
    
    # Vitals
    sys_bp = Column(Integer, nullable=True)
    dia_bp = Column(Integer, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    spo2 = Column(Float, nullable=True)
    temp = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    
    # Risk Analysis
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Low")
    
    # Operational
    zone = Column(String, default="General Ward")
    created_at = Column(DateTime, default=datetime.utcnow)