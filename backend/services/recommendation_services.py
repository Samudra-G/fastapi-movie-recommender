import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import joinedload
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import HTTPException
from backend.models.models import User, Movie, Recommendation, WatchHistory, Poster
from backend.cache.redis_cache import redis_cache
from backend.database.schemas import MovieRecommendation, RecommendationResponse

class RecommendationService:

    @staticmethod
    async def generate_recommendations(user_id: int, db: AsyncSession, top_n: int = 12):
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get user's watch history with embeddings
        result = await db.execute(
            select(Movie)
            .join(WatchHistory, WatchHistory.movie_id == Movie.movie_id)
            .where(WatchHistory.user_id == user_id)
        )
        watched_movies = result.scalars().all()

        if not watched_movies:
            raise HTTPException(status_code=404, detail="No watch history found")

        watched_embeddings = [
            np.array(movie.embedding) for movie in watched_movies if movie.embedding is not None
        ]
        if not watched_embeddings:
            raise HTTPException(status_code=404, detail="No embeddings in watch history")

        user_embedding = np.mean(watched_embeddings, axis=0).reshape(1, -1)

        # Get all movies not yet watched
        result = await db.execute(select(Movie))
        all_movies = result.scalars().all()

        # Ensure watched_movies is a list of Movie objects
        watched_ids = set()
        for m in watched_movies:
            if hasattr(m, "movie_id"):
                watched_ids.add(m.movie_id)

        # Collect candidate movies
        candidate_movies = []
        candidate_embeddings = []
        for movie in all_movies:
            if (
                hasattr(movie, "embedding") and movie.embedding is not None and
                hasattr(movie, "movie_id") and movie.movie_id not in watched_ids
            ):
                candidate_movies.append(movie)
                candidate_embeddings.append(movie.embedding)


        if not candidate_embeddings:
            raise HTTPException(status_code=404, detail="No new movies to recommend")

        candidate_embeddings = np.array(candidate_embeddings)
        similarities = cosine_similarity(user_embedding, candidate_embeddings)[0]
        sorted_indices = np.argsort(similarities)[::-1][:top_n]

        recommendations = [
            Recommendation(user_id=user_id, movie_id=candidate_movies[i].movie_id, score=float(similarities[i]))
            for i in sorted_indices
        ]

        # Clean and commit
        await redis_cache.delete_cache(f"recommendations:{user_id}")
        await db.execute(delete(Recommendation).where(Recommendation.user_id == user_id))
        db.add_all(recommendations)
        await db.flush() 
        await db.commit()

        movie_ids = [rec.movie_id for rec in recommendations]
        result = await db.execute(
            select(Poster.movie_id, Poster.image_path)
            .where(Poster.movie_id.in_(movie_ids))
        )
        poster_map = {mid: path for mid, path in result.all()}

        # Prepare cache
        movie_lookup = {movie.movie_id: movie for movie in candidate_movies}

        recommendations_dict = [
            {
                "movie_id": rec.movie_id,
                "title": movie_lookup[rec.movie_id].title,
                "genre": movie_lookup[rec.movie_id].genre,
                "score": rec.score,
                "poster_url": poster_map.get(rec.movie_id)
            }
            for rec in recommendations if rec.movie_id in movie_lookup
        ]
        await redis_cache.set_cache(f"recommendations:{user_id}", recommendations_dict, expire=1800)

        return {"message": "Personalized recommendations generated", "count": len(recommendations)}

    @staticmethod
    async def get_user_recommendations(user_id: int, db: AsyncSession, top_n: int = 12) -> RecommendationResponse:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Try cache
        cached = await redis_cache.get_cache(f"recommendations:{user_id}")
        if cached:
            return RecommendationResponse(user_id=user_id, recommendations=cached[:top_n])

        # Fallback to DB
        result = await db.execute(
            select(Recommendation, Movie, Poster.image_path)
            .join(Movie, Recommendation.movie_id == Movie.movie_id)
            .join(Poster, Poster.movie_id == Movie.movie_id, isouter=True)
            .where(Recommendation.user_id == user_id)
            .order_by(Recommendation.score.desc())
            .limit(top_n)
        )
        rows = result.all()

        if not rows:
            raise HTTPException(status_code=404, detail="No recommendations available")

        recommendations_list = [
            MovieRecommendation(
                movie_id=rec.movie_id,
                title=movie.title,
                genre=movie.genre,
                score=rec.score,
                poster_url=poster_url
            )
            for rec, movie, poster_url in rows
        ]
        listed_recommendations = [rec.model_dump() for rec in recommendations_list]

        await redis_cache.set_cache(f"recommendations:{user_id}", listed_recommendations, expire=1800)
        return RecommendationResponse(user_id=user_id, recommendations=recommendations_list)

    @staticmethod
    async def ensure_recommendations_exist(user_id: int, db: AsyncSession):
        cached = await redis_cache.get_cache(f"recommendations:{user_id}")
        if cached:
            return
        
        result = await db.execute(
            select(Recommendation)
            .where(Recommendation.user_id == user_id)
            .order_by(Recommendation.score.desc())
            .limit(1)
        )
        row = result.first()
        if row:
            await RecommendationService.get_user_recommendations(user_id, db)
        else:
            await RecommendationService.generate_recommendations(user_id, db)
