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
        orm_mode = True

class MovieResponse(MovieCreate):
    movie_id: int

    class Config:
        orm_mode = True

#users ORM model
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
