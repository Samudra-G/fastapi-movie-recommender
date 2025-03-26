from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import List, Optional
from datetime import datetime, date

#Movie schemas
class MovieCreate(BaseModel):
    title: str
    genre: Optional[str] = None
    release_date: Optional[date] = None
    embedding: Optional[List[float]] = None

    class Config:
        from_attributes = True

class MovieResponse(BaseModel):
    title: str
    genre: Optional[str] = None
    release_date: Optional[date] = None
    movie_id: int
    poster_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class MovieDetailResponse(MovieResponse):
    overview: Optional[str] = None

#users ORM model
class UserCreate(BaseModel):
    name: str = Field(..., alias="username")
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    name: str
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

#Recommendations ORM
class MovieRecommendation(BaseModel):
    movie_id: int
    title: str
    genre: str
    score: float
    poster_url: Optional[str] = None

class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[MovieRecommendation]