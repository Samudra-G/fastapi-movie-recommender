import asyncio
import requests
import os
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if TMDB_API_KEY is None:
    raise ValueError("TMDB_API_KEY is not set or invalid!")

MOVIES_TO_CHECK = [
    "Never Again",
    "Fly Me to the Moon",
    "U2 3D",
    "Star Wars: Clone Wars: Volume 1",
    "In the Name of the King III",
    "The Opposite Sex",
    "A Guy Named Joe",
    "The Other End of the Line",
    "24 7: Twenty Four Seven",
    "#Horror",
    "Wind Walkers",
    "Bleeding Hearts",
    "Reality Show",
    "Yesterday Was a Lie",
    "The 5th Quarter",
    "Under the Same Moon",
]

async def get_tmdb_movie_id(title):
    """Fetch TMDb search results for a movie title."""
    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={title}"
    
    response = requests.get(url)
    data = response.json()
    
    if data.get("results"):
        print(f"\nResults for '{title}':")
        for movie in data["results"]:
            print(f"  TMDb ID: {movie['id']}, Title: {movie['title']}, Year: {movie.get('release_date', 'N/A')}")
    else:
        print(f"\nNo match found for '{title}'")

async def check_missing_movies():
    """Check each missing movie in TMDb."""
    for movie in MOVIES_TO_CHECK:
        await get_tmdb_movie_id(movie)

if __name__ == "__main__":
    asyncio.run(check_missing_movies())
