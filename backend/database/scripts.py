import json
import pandas as pd
import numpy as np
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.models.models import Movie, Genre, MovieGenre
from backend.database.database import AsyncSessionLocal
from datetime import datetime

# ✅ Load dataset
df = pd.read_csv("C:/Datasets/tmdb_cleaned_movies.csv")

# ✅ Function to safely convert values
def safe_int(value, default: int | None = 0):
    try:
        return int(value) if pd.notna(value) and value != '' else default
    except (ValueError, TypeError):
        return default

def safe_float(value, default: float | None = 0.0):
    try:
        return float(value) if pd.notna(value) and value != '' else default
    except (ValueError, TypeError):
        return default

async def populate_database():
    async with AsyncSessionLocal() as session:
        genre_map = {}

        # ✅ Insert genres first
        for _, row in df.iterrows():
            try:
                movie_genres = json.loads(row["genres"]) if isinstance(row["genres"], str) else []
            except json.JSONDecodeError:
                movie_genres = []

            for genre in movie_genres:
                genre_name = genre["name"].strip()

                if genre_name not in genre_map:
                    result = await session.execute(select(Genre).filter_by(name=genre_name))
                    db_genre = result.scalars().first()

                    if not db_genre:
                        db_genre = Genre(name=genre_name)
                        session.add(db_genre)
                        await session.flush()  # ✅ Ensures ID is assigned

                    genre_map[genre_name] = db_genre.id
        
        # ✅ Commit genres before inserting movies
        await session.commit()

        # ✅ Insert movies and relationships
        for _, row in df.iterrows():
            try:
                movie_genres = json.loads(row["genres"]) if isinstance(row["genres"], str) else []
            except json.JSONDecodeError:
                movie_genres = []

            # ✅ Convert release_date safely
            release_date = None
            if isinstance(row["release_date"], str):
                try:
                    release_date = datetime.strptime(row["release_date"], "%Y-%m-%d").date()
                except ValueError:
                    pass

            # ✅ Convert values safely
            vote_count = safe_int(row.get("vote_count"))
            vote_average = safe_float(row.get("vote_average"))
            runtime = safe_int(row.get("runtime"), default=None)

            movie = Movie(
                title=row["title"].strip() if isinstance(row["title"], str) else "Unknown",
                genre=", ".join([g["name"].strip() for g in movie_genres]) if movie_genres else None,
                release_date=release_date,
                embedding=np.zeros(768).tolist(),  # ✅ Placeholder for embeddings
                vote_count=vote_count,
                vote_average=vote_average,
                runtime=runtime
            )
            
            session.add(movie)
            await session.flush()  # ✅ Ensures movie ID is available

            # ✅ Insert movie-genre relationships
            for genre in movie_genres:
                genre_id = genre_map.get(genre["name"].strip())
                if genre_id:
                    movie_genre = MovieGenre(movie_id=movie.movie_id, genre_id=genre_id)
                    session.add(movie_genre)

        # ✅ Commit all changes
        await session.commit()

    print("✅ Database populated successfully!")

asyncio.run(populate_database())
