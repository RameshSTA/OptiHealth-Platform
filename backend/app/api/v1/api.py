from fastapi import APIRouter
from app.api.v1.endpoints import auth, patients, ml, dashboard, governance,support

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Analytics"])
api_router.include_router(governance.router, prefix="/governance", tags=["Governance"])
api_router.include_router(governance.router, prefix="/support", tags=["Support"])