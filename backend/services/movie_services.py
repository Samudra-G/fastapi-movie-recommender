import numpy as np
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.models.models import Movie, Poster
from backend.database.schemas import MovieCreate, MovieRecommendation
from sklearn.metrics.pairwise import cosine_similarity
from backend.cache.redis_cache import redis_cache
from backend.auth.utils import to_dict
from fastapi import HTTPException, Query
from typing import Optional

logger = logging.getLogger(__name__)

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
        try:
            movie_dict = to_dict(movie)
        except Exception as e:
            logger.error("to_dict failed: ", e)
            raise 
        movie_dict["poster_url"] = poster_url 

        try:
            await redis_cache.set_cache(cache_key, movie_dict, expire=3600)
        except Exception as e:
            logger.error("set_cache failed: ", e)
            raise 
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

            await redis_cache.set_movies_cache(genre, movies_dict, expire=3600, per_page=per_page)

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
        
    @staticmethod
    async def search_movies(db: AsyncSession, q: Optional[str] = None, genre: Optional[str] = None):
        cache_key = f"search_movies:{q}:{genre}"
        cached_movies = await redis_cache.get_cache(cache_key)
        if cached_movies:
            return cached_movies

        query = select(Movie, Poster.image_path).join(Poster, Poster.movie_id == Movie.movie_id, isouter=True)

        if q:
            query = query.where(Movie.title.ilike(f"%{q}%"))
        if genre:
            query = query.where(Movie.genre.ilike(f"%{genre}%"))

        query = query.limit(12)  
        result = await db.execute(query)
        movies = result.all()

        if not movies:
            raise HTTPException(status_code=404, detail="No movies found")

        movies_dict = []
        seen_movies = {}

        for movie, poster_url in movies:
            movie_id = movie.movie_id
            if movie_id not in seen_movies:
                movie_dict = to_dict(movie)
                movie_dict["poster_url"] = poster_url
                seen_movies[movie_id] = movie_dict
                movies_dict.append(movie_dict)

            else:
                if "poster_urls" not in seen_movies[movie_id]:
                    seen_movies[movie_id]["poster_urls"] = []
                seen_movies[movie_id]["poster_urls"].append(poster_url)

        await redis_cache.set_cache(cache_key, movies_dict, expire=600)

        return movies_dict

    @staticmethod
    async def get_similar_movies(movie_id: int, db: AsyncSession, top_n: int = 10):

        cache_key = f"similar_movies:{movie_id}"
        cached_similar_movies = await redis_cache.get_cache(cache_key)
        if cached_similar_movies:
            return cached_similar_movies[:top_n]

        # Retrieve the target movie
        movie = await db.get(Movie, movie_id)
        if not movie or movie.embedding is None:
            raise HTTPException(status_code=404, detail="Movie not found or missing embedding")

        target_embedding = np.array(movie.embedding).reshape(1, -1)

        # Fetch all movies with embeddings
        result = await db.execute(
            select(Movie, Poster.image_path)
            .join(Poster, Poster.movie_id == Movie.movie_id, isouter=True)
            .where(Movie.embedding.isnot(None))
        )
        movies = result.all()

        if not movies:
            raise HTTPException(status_code=404, detail="No movies with embeddings available")

        movie_list = []
        embedding_matrix = []
        posters_dict = {}  # Store poster URLs

        for m, poster_url in movies:
            if m.movie_id != movie_id:
                movie_list.append(m)
                embedding_matrix.append(m.embedding)
                posters_dict[m.movie_id] = poster_url  # Store poster URL for each movie

        if not embedding_matrix:
            raise HTTPException(status_code=404, detail="No valid movie embeddings found")

        embedding_matrix = np.array(embedding_matrix)

        similarities = cosine_similarity(target_embedding, embedding_matrix)[0]
        sorted_indices = np.argsort(similarities)[::-1][:top_n]

        similar_movies = [
            MovieRecommendation(
                movie_id=movie_list[i].movie_id,
                title=movie_list[i].title,
                genre=movie_list[i].genre,
                score=float(similarities[i]),
                poster_url=posters_dict.get(movie_list[i].movie_id)  
            )
            for i in sorted_indices
        ]

        # Cache results
        listed_similar_movies = [rec.model_dump() for rec in similar_movies]
        await redis_cache.set_cache(cache_key, listed_similar_movies, expire=1800)

        return similar_movies
