from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from backend.database.schemas import MovieCreate, MovieResponse
from backend.models.models import Movie
from backend.database.database import get_db
from backend.database.schemas import TokenData
from backend.auth.admin import admin_required
from backend.auth.utils import to_dict
from backend.cache.redis_cache import redis_cache
import json
router = APIRouter(
    prefix = "/movies",
    tags = ["Movies"]
)

#add movie
@router.post("/", response_model=MovieResponse, status_code=201)
async def create_movie(movie: MovieCreate, db: AsyncSession = Depends(get_db),
                  current_user: TokenData = Depends(admin_required)):
    
    result = await db.execute(select(Movie).where(Movie.title == movie.title))
    existing_movie = result.scalars().first()
    if existing_movie:
        raise HTTPException(status_code=400, detail="Movie with this title already exists.")
    
    try:
        db_movie = Movie(**movie.model_dump())
        db.add(db_movie)
        await db.commit()
        await db.refresh(db_movie)
        return db_movie
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occured: {str(e)}")
    
#get movie by id
@router.get("/{movie_id}", response_model=MovieResponse, status_code=200)
async def get_movie(movie_id: int, db : AsyncSession = Depends(get_db)):
    cache_key = f"movie_{movie_id}"

    #Checking redis for stored cache
    cached_movie = await redis_cache.get_cache(cache_key)
    if cached_movie:
        return cached_movie
    
    result = await db.execute(select(Movie).where(Movie.movie_id == movie_id))
    movie = result.scalars().first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found.")
    
    movie_dict = to_dict(movie)
    await redis_cache.set_cache(cache_key, movie_dict, expire=3600)

    return movie

#get all movies or by genre
@router.get("/", response_model=List[MovieResponse])
async def get_movies(genre: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    try:
        cache_key = f"movies:{genre if genre else 'all'}"
        cached_movies = await redis_cache.get_cache(cache_key)

        if cached_movies:
            return cached_movies
        
        query = select(Movie)
        if genre:
            query = query.where(Movie.genre.ilike(f"%{genre}%"))
        
        result = await db.execute(query)
        movies = result.scalars().all()
        if not movies:
            raise HTTPException(status_code=404, detail="No movies found")
        
        movies_dict = [to_dict(movie) for movie in movies]
        await redis_cache.set_cache(cache_key, movies_dict, expire=3600)
        return movies
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occured: {str(e)}")

#update movie: will add to admin privilege later
@router.put("/{movie_id}", response_model=MovieResponse, status_code=200)
async def update_movie(movie_id: int, movie: MovieCreate, db: AsyncSession = Depends(get_db), 
                 current_user: TokenData = Depends(admin_required)):
    result = await db.execute(select(Movie).where(Movie.movie_id == movie_id))
    db_movie = result.scalars().first()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found.")
    
    for key, value in movie.model_dump(exclude_unset=True).items():
        setattr(db_movie, key, value)
    
    await db.commit()
    await db.refresh(db_movie)

    return db_movie

#delete movie
@router.delete("/{movie_id}", status_code=204)
async def delete_movie(movie_id: int, db: AsyncSession = Depends(get_db), current_user: TokenData = Depends(admin_required)):

    result = await db.execute(select(Movie).where(Movie.movie_id == movie_id))    
    db_movie = result.scalars().first()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    try:
        await db.delete(db_movie)
        await db.commit()

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occured: {str(e)}")