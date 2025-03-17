import os
import torch
import numpy as np
import asyncio
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModel
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.future import select
from backend.database.database import engine
from backend.models.models import Movie, MovieGenre, Genre

# Load environment variables
load_dotenv()

MODEL_NAME = os.getenv("MODEL_PATH")
if not MODEL_NAME:
    raise ValueError("MODEL_PATH environment variable is not set or invalid")

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
model.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

async_session = async_sessionmaker(engine, autocommit=False, autoflush=False, expire_on_commit=False)

# Movie IDs with zero embeddings
ZERO_EMBEDDING_MOVIES = [
    38433, 34390, 34608, 33796, 34391, 33991, 34389  # List of affected movie IDs
]


async def get_embeddings(text: str) -> np.ndarray:
    """Generate BERT embeddings for the given text."""
    tokens = tokenizer(text, padding="max_length", truncation=True, max_length=512, return_tensors="pt").to(device)

    with torch.no_grad():
        output = model(**tokens)
        embedding = output.last_hidden_state[:, 0, :].squeeze().cpu().numpy()  # CLS token

    return embedding.tolist()


async def get_movie_genres(session, movie_id):
    """Fetch movie genres as a comma-separated string."""
    result = await session.execute(
        select(Genre.name)
        .join(MovieGenre, MovieGenre.genre_id == Genre.id)
        .where(MovieGenre.movie_id == movie_id)
    )
    genres = [row[0] for row in result.fetchall()]
    return ", ".join(genres) if genres else ""


async def update_movie_embeddings():
    """Fetch movies with zero embeddings and update them."""
    async with async_session() as session:
        result = await session.execute(select(Movie).where(Movie.movie_id.in_(ZERO_EMBEDDING_MOVIES)))
        movies = result.scalars().all()

        if not movies:
            print("No movies found with zero embeddings.")
            return

        print(f"Found {len(movies)} movies with zero embeddings. Updating...")

        for movie in movies:
            genres = await get_movie_genres(session, movie.movie_id)
            text_input = f"{movie.overview} {genres}".strip() if movie.overview is not None else genres

            if not text_input:
                print(f"Skipping movie {movie.movie_id} - No text data available for embedding.")
                continue

            embedding = await get_embeddings(text_input)
            movie.embedding = embedding  # type: ignore
            session.add(movie)

        await session.commit()
        print("Embeddings updated successfully!")


if __name__ == "__main__":
    try:
        asyncio.run(update_movie_embeddings())
    except RuntimeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(update_movie_embeddings())
