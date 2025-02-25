import os
import json
import redis.asyncio as redis
from typing import Optional, Union
from dotenv import load_dotenv

load_dotenv()
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")

class RedisCache:
    def __init__(self) -> None:
        self.redis : Optional[redis.Redis] = None
    
    async def connect(self):
        try:
            if REDIS_PORT is None:
                raise ValueError("REDIS_PORT is None")
            if REDIS_HOST is None:
                raise ValueError("REDIS_HOST is None")
            
            self.redis = redis.Redis(host=REDIS_HOST, port=int(REDIS_PORT),
                                            decode_responses=True)
        except Exception as e:
            raise RuntimeError(f"Failed to connect to Redis: {e}")
    
    def is_connected(self):
        if not self.redis:
            raise RuntimeError(f"Redis connection not initialized. Call connect() first")
        
    async def set_cache(self, key:str, value: Union[dict, list], expire: int = 600):
        self.is_connected()
        assert self.redis is not None
        await self.redis.setex(key, expire, json.dumps(value))
    
    async def get_cache(self, key:str) -> Optional[Union[dict, list]]:
        self.is_connected()
        assert self.redis is not None

        data = await self.redis.get(key)
        return json.loads(data) if data else None
    
    async def delete_cache(self, key:str):
        self.is_connected()
        assert self.redis is not None
        
        await self.redis.delete(key)

    async def disconnect(self):
        if self.redis:
            await self.redis.close()
            self.redis = None

redis_cache = RedisCache()