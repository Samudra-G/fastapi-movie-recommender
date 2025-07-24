import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database.database import async_sessionmaker, engine
from backend.models.models import Movie, Genre, MovieGenre

async_session = async_sessionmaker(engine, autocommit=False, autoflush=False, expire_on_commit=False)

async def populate_movie_genre():
    async with async_session() as session:
        # Fetch all movies
        result = await session.execute(select(Movie))
        movies = result.scalars().all()

        for movie in movies:
            genre_data = movie.genre  # Access actual column value
    
            if isinstance(genre_data, str):
                genre_list = [g.strip() for g in genre_data.split(",")]  # Convert string -> list

                for genre_name in genre_list:
                        # Fetch genre_id from Genre table
                    genre_result = await session.execute(select(Genre).filter_by(name=genre_name.strip()))
                    genre_obj = genre_result.scalars().first()

                    if genre_obj:
                          # Check if mapping already exists
                        existing_entry = await session.execute(
                                select(MovieGenre).filter_by(movie_id=movie.movie_id, genre_id=genre_obj.id)
                            )
                        if not existing_entry.scalars().first():
                            session.add(MovieGenre(movie_id=movie.movie_id, genre_id=genre_obj.id))

        await session.commit()
        print("✅ MovieGenre table updated successfully!")

# Run the async function
if __name__ == "__main__":
    asyncio.run(populate_movie_genre())
