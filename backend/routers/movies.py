from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.schemas import MovieCreate, MovieResponse
from backend.models.models import Movie
from backend.database.database import get_db
from backend.database.schemas import TokenData
from backend.auth.oauth2 import get_current_user

router = APIRouter(
    prefix = "/movies",
    tags = ["Movies"]
)

#add movie
@router.post("/", response_model=MovieResponse, status_code=201)
def create_movie(movie: MovieCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to perform action")
    
    existing_movie = db.query(Movie).filter(Movie.title == movie.title).first()
    if existing_movie:
        raise HTTPException(status_code=400, detail="Movie with this title already exists.")
    
    try:
        db_movie = Movie(**movie.model_dump())
        db.add(db_movie)
        db.commit()
        db.refresh(db_movie)
        return db_movie
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occured: {str(e)}")
    
#get movie by id
@router.get("/{movie_id}", response_model=MovieResponse, status_code=200)
def get_movie(movie_id: int, db : Session = Depends(get_db)):
    
    movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found.")
    return movie

#get all movies or by genre
@router.get("/", response_model=List[MovieResponse])
def get_movies(genre: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        query = db.query(Movie)
        if genre:
            query = query.filter(Movie.genre.ilike(f"%{genre}%"))
            
        movies = query.all()
        if not movies:
            raise HTTPException(status_code=404, detail="No movies found")
        return movies
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occured: {str(e)}")

#update movie: will add to admin privilege later
@router.put("/{movie_id}", response_model=MovieResponse, status_code=200)
def update_movie(movie_id: int, movie: MovieCreate, db: Session = Depends(get_db), 
                 current_user: TokenData = Depends(get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to perform action")
    
    db_movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found.")
    
    for key, value in movie.model_dump(exclude_unset=True).items():
        setattr(db_movie, key, value)
    
    db.commit()
    db.refresh(db_movie)

    return db_movie

#delete movie
@router.delete("/{movie_id}", status_code=204)
def delete_movie(movie_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to perform action")
    
    db_movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    try:
        db.delete(db_movie)
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occured: {str(e)}")