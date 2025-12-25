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

# Create Database Tables (Auto-migration for simple setups)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OptiHealth API", version="2.0.0")

# --- CORS Configuration (PRODUCTION READY) ---
# 1. Local Development Origins
origins = [
    "http://localhost:3000",      # React/Vite Localhost
    "http://127.0.0.1:3000",      # React/Vite IP
    "http://localhost:5173",      # Vite Default Port (Backup)
    "http://127.0.0.1:5173",      # Vite IP (Backup)
]

# 2. Add Production Origins (Vercel)
# I added your EXACT URL from the screenshot here:
prod_origins = [
    "https://optihealth.vercel.app", 
    "https://optihealth-frontend.vercel.app",
    "https://optihealth-platform.vercel.app",  # <--- ADDED THIS (Your real URL)
    "https://optihealth-platform.vercel.app/"  # <--- ADDED THIS (With slash)
]

# Allow specific origins ONLY (No wildcard "*" allowed with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + prod_origins, # <--- FIXED: Removed + ["*"]
    allow_credentials=True,
    allow_methods=["*"],          # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],          # Allow all headers (Content-Type, Auth, etc.)
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