from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from backend.database.schemas import MovieCreate, MovieResponse
from backend.models.models import Movie
from backend.database.database import get_db
from backend.database.schemas import TokenData
from backend.auth.admin import admin_required
from backend.services.movie_services import MovieService

router = APIRouter(
    prefix = "/movies",
    tags = ["Movies"]
)

#add movie
@router.post("/", response_model=MovieResponse, status_code=201)
async def create_movie(movie: MovieCreate, db: AsyncSession = Depends(get_db),
                  current_user: TokenData = Depends(admin_required)):
    return await MovieService.create_movie(movie, db)
    
#get movie by id
@router.get("/{movie_id}", response_model=MovieResponse, status_code=200)
async def get_movie(movie_id: int, db : AsyncSession = Depends(get_db)):
    return await MovieService.get_movie(movie_id, db)

#get all movies or by genre
@router.get("/", response_model=List[MovieResponse])
async def get_movies(genre: Optional[str] = None, db: AsyncSession = Depends(get_db)):    
    return await MovieService.get_movies(genre, db)

#update movie: will add to admin privilege later
@router.put("/{movie_id}", response_model=MovieResponse, status_code=200)
async def update_movie(movie_id: int, movie: MovieCreate, db: AsyncSession = Depends(get_db), 
                 current_user: TokenData = Depends(admin_required)):
    return await MovieService.update_movie(movie_id, movie, db)

#delete movie
@router.delete("/{movie_id}", status_code=204)
async def delete_movie(movie_id: int, db: AsyncSession = Depends(get_db),
                        current_user: TokenData = Depends(admin_required)):
    return await MovieService.delete_movie(movie_id, db)