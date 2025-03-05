from fastapi import FastAPI
from backend.database.database import engine, Base, AsyncSessionLocal
from contextlib import asynccontextmanager
from sqlalchemy.sql import text
from backend.models.models import User, Movie, Review, Poster, Recommendation
from backend.routers import movies, users, auth
from backend.cache.redis_cache import redis_cache
    
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

app = FastAPI(lifespan=lifespan)

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