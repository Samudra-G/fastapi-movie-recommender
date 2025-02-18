from pydantic import BaseModel
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