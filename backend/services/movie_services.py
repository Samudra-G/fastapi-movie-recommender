from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.models.models import Movie, Poster
from backend.database.schemas import MovieCreate
from backend.cache.redis_cache import redis_cache
from backend.auth.utils import to_dict
from fastapi import HTTPException
from typing import Optional

class MovieService:

    @staticmethod
    async def create_movie(movie: MovieCreate, db: AsyncSession):
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

    @staticmethod
    async def get_movie(movie_id: int, db: AsyncSession):
        cache_key = f"movie_{movie_id}"

        #Checking redis for stored cache
        cached_movie = await redis_cache.get_cache(cache_key)
        if cached_movie:
            return cached_movie
        
        result = await db.execute(select(Movie, Poster.image_path)
                                  .join(Poster, Poster.movie_id == Movie.movie_id, isouter=True)
                                  .where(Movie.movie_id == movie_id))
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Movie not found.")

        movie, poster_url = row  
        movie_dict = to_dict(movie)
        movie_dict["poster_url"] = poster_url 

        await redis_cache.set_cache(cache_key, movie_dict, expire=3600)

        return movie_dict

    @staticmethod
    async def get_movies(genre: Optional[str], db: AsyncSession, page: int=1, per_page: int=50):
        try:
            cached_movies = await redis_cache.get_movies_cache(genre,page,per_page)

            if cached_movies:
                return cached_movies 

            query = select(Movie, Poster.image_path).join(Poster, Poster.movie_id == Movie.movie_id, isouter=True)
            if genre:
                query = query.where(Movie.genre.ilike(f"%{genre}%"))
            
            query = query.offset((page - 1) * per_page).limit(per_page)
            result = await db.execute(query)
            movies = result.all()

            if not movies:
                raise HTTPException(status_code=404, detail="No movies found")

            movies_dict = []
            seen_movies = {}
            
            for movie, poster_url in movies:
                movie_id = movie.movie_id
                if movie.movie_id not in seen_movies:
                    movie_dict = to_dict(movie)
                    movie_dict["poster_url"] = poster_url
                    seen_movies[movie_id] = movie_dict
                    movies_dict.append(movie_dict)

                else:
                    if "poster_urls" not in seen_movies[movie_id]:
                        seen_movies[movie_id]["poster_urls"] = []
                    seen_movies[movie_id]["poster_urls"].append(poster_url)

            await redis_cache.set_movies_cache(genre, movies_dict, expire=3600)

            return movies_dict
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    @staticmethod
    async def update_movie(movie_id: int, movie: MovieCreate, db: AsyncSession):
        result = await db.execute(select(Movie).where(Movie.movie_id == movie_id))
        db_movie = result.scalars().first()
        if not db_movie:
            raise HTTPException(status_code=404, detail="Movie not found.")
        
        for key, value in movie.model_dump(exclude_unset=True).items():
            setattr(db_movie, key, value)
        
        await db.commit()
        await db.refresh(db_movie)

        return db_movie
    
    @staticmethod
    async def delete_movie(movie_id: int, db: AsyncSession):
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