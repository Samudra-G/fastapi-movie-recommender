import asyncio
import requests
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database.database import AsyncSessionLocal
from backend.models.models import Movie, Poster  

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if TMDB_API_KEY is None:
    raise ValueError("TMDB_API_KEY is not set or invalid!")

async def get_tmdb_movie_id(title, release_date=None):
    """Fetch TMDb ID for a movie title."""
    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={title}"
    if release_date:
        year = release_date.year  # Extract year directly
        url += f"&year={year}"
    
    response = requests.get(url)
    data = response.json()
    
    if data.get("results"):
        return data["results"][0]["id"]
    return None

async def get_movie_poster(tmdb_id):
    """Fetch poster URL for a given TMDb movie ID."""
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}/images?api_key={TMDB_API_KEY}"
    
    response = requests.get(url)
    data = response.json()
    
    if "posters" in data and data["posters"]:
        poster_path = data["posters"][0]["file_path"]
        return f"https://image.tmdb.org/t/p/w500{poster_path}"  # TMDb's base URL for images
    return None

async def update_movie_tmdb_data():
    """Update movies with TMDb IDs and add posters."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Movie).where(Movie.tmdb_id.is_(None)))
        movies = result.scalars().all()  # Get movies without tmdb_id
    
        for movie in movies:
            tmdb_id = await get_tmdb_movie_id(movie.title, movie.release_date if movie.release_date is not None else None)
            if tmdb_id:
                # Check if TMDb ID is already assigned to another movie
                existing_movie = await session.execute(select(Movie).where(Movie.tmdb_id == tmdb_id))
                if existing_movie.scalars().first():
                    continue

                movie.tmdb_id = tmdb_id 
                await session.commit()

                # Fetch and insert poster
                poster_url = await get_movie_poster(tmdb_id)
                if poster_url:
                    new_poster = Poster(movie_id=movie.movie_id, image_path=poster_url)
                    session.add(new_poster)
                    await session.commit()

            else:
                print(f"No TMDb match found for {movie.title}")

if __name__ == "__main__":
    asyncio.run(update_movie_tmdb_data())
