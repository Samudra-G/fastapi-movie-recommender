import os
from typing import Union
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.database.database import engine, Base, AsyncSessionLocal
from contextlib import asynccontextmanager
from sqlalchemy.sql import text
from backend.routers import movies, users, auth
from backend.cache.redis_cache import redis_cache
from dotenv import load_dotenv

load_dotenv()

CLIENT_URL = os.getenv("CLIENT_URL")
if not CLIENT_URL:
    raise ValueError("CLIENT_URL environment variable is not set or invalid")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up: Running DB migrations and connecting to Redis...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await redis_cache.connect()
    yield
    print("Shutting down: Closing DB and Redis connections...")
    await redis_cache.disconnect()
    await engine.dispose()

def rate_limit_exceeded_handler(request: Request, exc: Union[Exception, RateLimitExceeded]):
    return  JSONResponse(status_code=429, content={"error": "Too many request. Try again later."})

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CLIENT_URL, 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(movies.router)
app.include_router(users.router)
app.include_router(auth.router)

@app.get('/')
async def read_root():
    return {"message":"Server is running"}

@app.get('/test-db')
async def test_db():
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status":"Database Connected"}
    except Exception as e:
        return {"status":"Database Connection Failed","error":str(e)}
    finally:
        await session.close()

@app.get("/test-redis")
async def test_redis():
    test_key = "test_key"
    test_value = {"message": "Redis is working"}

    await redis_cache.set_cache(test_key, test_value, expire=60)

    retrieved_value = await redis_cache.get_cache(test_key)

    return {"stored_value" : retrieved_value}