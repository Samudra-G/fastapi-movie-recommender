from fastapi import FastAPI
from backend.database.database import engine, Base, AsyncSessionLocal
from contextlib import asynccontextmanager
from sqlalchemy.sql import text
from backend.models.models import User, Movie, Review, Poster, Recommendation
from backend.routers import movies, users, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up: Running DB migrations...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    print("Shutting down: Closing DB connections...")
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

app.include_router(movies.router)
app.include_router(users.router)
app.include_router(auth.router)

@app.get('/')
async def read_root():
    return {"message":"Welcome to this API"}

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