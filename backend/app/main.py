import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- Imports for Routes ---
from app.api.v1.endpoints import patients, ml, dashboard, governance, auth, support

# --- Imports for Database Creation ---
from app.db.session import engine
from app.db.base_class import Base

# *** CRITICAL: Import ALL models here so SQLAlchemy detects them ***
from app.models.user import User
from app.models.patient import Patient 

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OptiHealth API", version="2.0.0")

# --- CORS Configuration (THE HYBRID FIX) ---
# 1. Allow specific Localhost ports (Safe & Stable)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# 2. Allow ALL Vercel Previews using a Simple Regex
# This tells the server: "If the URL ends in .vercel.app, let it in."
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Check Localhost list first
    allow_origin_regex=r"https://.*\.vercel\.app",  # Then check Vercel Regex
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Routers ---
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(ml.router, prefix="/api/v1/ml", tags=["ml"])
app.include_router(governance.router, prefix="/api/v1/governance", tags=["governance"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(support.router, prefix="/api/v1/support", tags=["support"])

@app.get("/")
def read_root():
    return {"status": "operational", "version": "v2.0.0", "env": os.getenv("ENV", "dev")}