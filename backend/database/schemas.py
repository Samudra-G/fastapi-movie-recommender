from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

#Movie schemas
class MovieCreate(BaseModel):
    title: str
    genre: Optional[str] = None
    release_date: Optional[datetime] = None
    embedding: Optional[str] = None

    class Config:
        from_attributes = True

class MovieResponse(MovieCreate):
    movie_id: int

    class Config:
        from_attributes = True

#users ORM model
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    email: EmailStr
    created_at: datetime
    role: str
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRoleUpdate(BaseModel):
    role: str

#Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    role: Optional[str] = None