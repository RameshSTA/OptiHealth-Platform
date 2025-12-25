from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.auth_service import auth_service
from app.schemas.auth import UserCreate, User, LoginRequest, Token

router = APIRouter()

@router.post("/signup", response_model=User)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = auth_service.create_user(db, user_in)
    return user

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )
    # In a real app, generate a JWT here. For now, we return a mock token.
    return {
        "access_token": "fake-jwt-token-for-demo",
        "token_type": "bearer",
        "user": user
    }