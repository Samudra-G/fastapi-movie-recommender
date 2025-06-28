import os
import ujson
import redis.asyncio as redis
from typing import Optional, Union
from dotenv import load_dotenv
from sqlalchemy.future import select
from backend.database.database import AsyncSessionLocal
from backend.models.models import Movie
from backend.auth.utils import to_dict

load_dotenv()
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")

class RedisCache:
    def __init__(self) -> None:
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        try:
            if REDIS_PORT is None:
                raise ValueError("REDIS_PORT is None")
            if REDIS_HOST is None:
                raise ValueError("REDIS_HOST is None")

            self.redis = redis.Redis(
                host=REDIS_HOST,
                port=int(REDIS_PORT),
                decode_responses=True,
                max_connections=100,
                socket_keepalive=True,
            )

            await self.preload_movies()

        except Exception as e:
            raise RuntimeError(f"Failed to connect to Redis: {e}")

    def is_connected(self):
        if not self.redis:
            raise RuntimeError("Redis connection not initialized. Call connect() first")

    async def set_cache(self, key: str, value: Union[dict, list], expire: int = 600):
        self.is_connected()
        assert self.redis is not None
        await self.redis.setex(key, expire, ujson.dumps(value))

    async def get_cache(self, key: str) -> Optional[Union[dict, list]]:
        self.is_connected()
        assert self.redis is not None

        data = await self.redis.get(key)
        return ujson.loads(data) if data else None

    async def delete_cache(self, key: str):
        self.is_connected()
        assert self.redis is not None
        await self.redis.delete(key)

    async def set_movies_cache(
        self,
        genre: Optional[str],
        movies: list,
        expire: int = 600,
        per_page: int = 50,
    ):
        self.is_connected()
        assert self.redis is not None

        redis_key_prefix = f"movies:{genre if genre else 'all'}"

        for i in range(0, len(movies), per_page):
            page = i // per_page + 1
            redis_key = f"{redis_key_prefix}:page:{page}"

            '''movies_serializable = [
                to_dict(movie) if not isinstance(movie, dict) else movie
                for movie in movies[i : i + per_page]
            ]'''
            await self.redis.setex(redis_key, expire, ujson.dumps(movies[i : i + per_page]))

        total_pages = (len(movies) + per_page - 1) // per_page
        await self.redis.setex(
            f"{redis_key_prefix}:total_pages", expire, total_pages
        )

    async def get_movies_cache(
        self, genre: Optional[str], page: int = 1, per_page: int = 50
    ) -> list[dict]:
        self.is_connected()
        assert self.redis is not None

        redis_key = f"movies:{genre if genre else 'all'}:page:{page}"
        movies_data = await self.redis.get(redis_key)

        if not movies_data:
            return []

        movies = ujson.loads(movies_data)
        return movies

    async def preload_movies(self):
        self.is_connected()
        assert self.redis is not None

        # Preload only page 1 as check
        existing_cache = await self.get_movies_cache(None, 1, 1)
        if existing_cache:
            print("Movies already cached.")
            return

        print("Preloading movies...")
        async with AsyncSessionLocal() as session:
            movies = await session.scalars(select(Movie))
            movies = movies.all()
            movie_list = [
                to_dict(movie) if not isinstance(movie, dict) else movie
                for movie in movies
            ]

            await self.set_movies_cache(None, movie_list)

        print("Movies preloaded successfully.")

    async def disconnect(self):
        if self.redis:
            await self.redis.close()
            self.redis = None


redis_cache = RedisCache()
