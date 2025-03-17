import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database.database import async_sessionmaker, engine
from backend.models.models import Movie

async_session = async_sessionmaker(engine, autocommit=False, autoflush=False, expire_on_commit=False)

# Load dataset
df = pd.read_csv("C:/Datasets/tmdb_5000_movies.csv")
df["overview"] = df["overview"].fillna("")
title_to_overview = dict(zip(df["title"], df["overview"]))

async def populate_overview():
    async with async_session() as session:
        # Fetch all movies from the database
        result = await session.execute(select(Movie))
        movies = result.scalars().all()

        for movie in movies:
            if movie.title in title_to_overview:
                movie.overview = title_to_overview[movie.title]  # Update the overview

        await session.commit()
        print("✅ Overview column populated successfully!")

# Run the async function
if __name__ == "__main__":
    import asyncio
    asyncio.run(populate_overview())
