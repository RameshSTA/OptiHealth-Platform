from pydantic import BaseModel, EmailStr
from typing import Optional

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    hospital_id: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to return to client
class User(UserBase):
    id: int
    role: str
    class Config:
        orm_mode = True

# Login Payload
class LoginRequest(BaseModel):
    email: str
    password: str

# Token Response
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User