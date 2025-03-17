import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import HTTPException
from backend.models.models import User, Movie, Recommendation
from backend.cache.redis_cache import redis_cache

class RecommendationService:

    @staticmethod
    async def generate_recommendations(user_id: int, db: AsyncSession, top_n: int = 10):
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        result = await db.execute(select(Movie))
        movies = result.scalars().all()

        if not movies:
            raise HTTPException(status_code=404, detail="No movies available")

        movie_list = []
        embedding_matrix = []

        for movie in movies:
            if movie.embedding is not None:
                movie_list.append(movie)
                embedding_matrix.append(movie.embedding)

        if not embedding_matrix:
            raise HTTPException(status_code=404, detail="No valid movie embeddings found")

        embedding_matrix = np.array(embedding_matrix)

        
        user_embedding = np.mean(embedding_matrix, axis=0).reshape(1, -1)  # Average of all movie embeddings
        similarities = cosine_similarity(user_embedding, embedding_matrix)[0]

        sorted_indices = np.argsort(similarities)[::-1][:top_n]
        recommendations = [
            Recommendation(user_id=user_id, movie_id=movie_list[i].movie_id, score=float(similarities[i]))
            for i in sorted_indices
        ]

        await redis_cache.delete_cache(f"recommendations:{user_id}")

        await db.execute(delete(Recommendation).where(Recommendation.user_id == user_id))
        db.add_all(recommendations)
        await db.commit()

        recommendations_dict = [
        {
            "movie_id": rec.movie_id,
            "title": movie_list[i].title, 
            "genre": movie_list[i].genre,
            "score": rec.score
        }
        for i, rec in enumerate(recommendations)
    ]
        await redis_cache.set_cache(f"recommendations:{user_id}", recommendations_dict)

        return {"message": "Recommendations generated successfully", "count": len(recommendations)}

    @staticmethod
    async def get_user_recommendations(user_id: int, db: AsyncSession, top_n: int = 10):

        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        cached_recommendations = await redis_cache.get_cache(f"recommendations:{user_id}")
        if cached_recommendations:
            return {
                "user_id": user_id,
                "recommendations": cached_recommendations[:top_n]
            }
        
        result = await db.execute(
            select(Recommendation, Movie)
            .join(Movie, Recommendation.movie_id == Movie.movie_id)
            .where(Recommendation.user_id == user_id)
            .order_by(Recommendation.score.desc())
            .limit(top_n)
        )

        recommendations = result.all()

        if not recommendations:
            return {"message": "No recommendations available"}

        recommendations_list = [
        {
            "movie_id": recommendation.movie_id,
            "title": movie.title,
            "genre": movie.genre,
            "score": recommendation.score
        }
        for recommendation, movie in recommendations  
    ]
        await redis_cache.set_cache(f"recommendations:{user_id}", recommendations_list, expire=1800)

        return {
            "user_id": user_id,
            "recommendations": recommendations_list
        }
        