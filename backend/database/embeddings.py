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

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
model.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

async_session = async_sessionmaker(engine, autocommit=False, autoflush=False, expire_on_commit=False)

BATCH_SIZE = 100


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


async def process_batch(movies_batch, session):
    """Generate embeddings and update a batch of movies."""
    tasks = [get_movie_genres(session, movie.movie_id) for movie in movies_batch]
    genres_list = await asyncio.gather(*tasks)  # Fetch genres in parallel

    embeddings_tasks = [
        get_embeddings(f"{movie.overview} {genres}" if movie.overview else genres)
        for movie, genres in zip(movies_batch, genres_list)
    ]
    embeddings = await asyncio.gather(*embeddings_tasks)

    for movie, embedding in zip(movies_batch, embeddings):
        movie.embedding = embedding  # type: ignore
        session.add(movie)

    await session.commit()  # Commit after processing each batch


async def update_movie_embeddings():
    """Fetch movies in batches, generate embeddings, and update in the database."""
    async with async_session() as session:
        offset = 3800 #changing from 0 to 3800 for now
        while True:
            # Fetch batch of movies
            result = await session.execute(select(Movie).offset(offset).limit(BATCH_SIZE))
            movies = result.scalars().all()

            if not movies:  # Stop when no more movies are left
                break

            await process_batch(movies, session)
            offset += BATCH_SIZE  # Move to next batch

            print(f"Processed {offset} movies...")

    print("Movie embeddings updated successfully!")


if __name__ == "__main__":
    try:
        asyncio.run(update_movie_embeddings())
    except RuntimeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(update_movie_embeddings())
