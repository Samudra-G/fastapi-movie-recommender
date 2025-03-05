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
def safe_int(value, default=0):
    try:
        return int(value) if pd.notna(value) and value != '' else default
    except ValueError:
        return default

def safe_float(value, default=0.0):
    try:
        return float(value) if pd.notna(value) and value != '' else default
    except ValueError:
        return default

async def populate_database():
    async with AsyncSessionLocal() as session:
        genre_map = {}

        # ✅ Step 1: Insert genres into the `genres` table
        unique_genres = set()

        for _, row in df.iterrows():
            # ✅ Extract genres correctly
            if isinstance(row["genres"], list):
                movie_genres = row["genres"]
            elif isinstance(row["genres"], str):  # Handle string-lists
                try:
                    movie_genres = eval(row["genres"])  # Convert string representation of list to actual list
                except:
                    movie_genres = []
            else:
                movie_genres = []

            unique_genres.update(movie_genres)  # ✅ Collect unique genre names

        # ✅ Insert genres if they don’t already exist
        for genre_name in unique_genres:
            result = await session.execute(select(Genre).filter_by(name=genre_name))
            db_genre = result.scalars().first()

            if not db_genre:
                db_genre = Genre(name=genre_name)
                session.add(db_genre)
                await session.flush()  # ✅ Ensures ID is assigned
                genre_map[genre_name] = db_genre.id

        # ✅ Commit genres before inserting movies
        await session.commit()

        # ✅ Step 2: Insert movies and relationships
        for _, row in df.iterrows():
            # ✅ Extract genres correctly
            if isinstance(row["genres"], list):
                movie_genres = row["genres"]
            elif isinstance(row["genres"], str):  # Handle string-lists
                try:
                    movie_genres = eval(row["genres"])
                except:
                    movie_genres = []
            else:
                movie_genres = []

            # ✅ Convert list to comma-separated string
            genre_string = ", ".join(movie_genres) if movie_genres else ""

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
            runtime = safe_int(row.get("runtime"), default=0)

            movie = Movie(
                title=row["title"].strip() if isinstance(row["title"], str) else "Unknown",
                release_date=release_date,
                genre=genre_string,  # ✅ Store genres as a comma-separated string
                embedding=np.zeros(768).tolist(),  # ✅ Placeholder for embeddings
                vote_count=vote_count,
                vote_average=vote_average,
                runtime=runtime
            )

            session.add(movie)
            await session.flush()  # ✅ Ensures movie ID is available

            # ✅ Step 3: Insert movie-genre relationships into `movie_genre`
            for genre_name in movie_genres:
                genre_id = genre_map.get(genre_name)
                if genre_id:
                    movie_genre = MovieGenre(movie_id=movie.movie_id, genre_id=genre_id)
                    session.add(movie_genre)

        # ✅ Commit all changes
        await session.commit()

    print("✅ Database populated successfully!")

# ✅ Run the script
asyncio.run(populate_database())
