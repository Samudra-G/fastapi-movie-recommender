from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from sqlalchemy.dialects.postgresql import insert as pg_insert
from fastapi import HTTPException
from backend.models.models import User, WatchHistory, Movie, Poster
from backend.auth.utils import to_dict
from backend.database.schemas import UserCreate, UserRoleUpdate
from backend.auth.utils import hash_password

class UserService:

    @staticmethod
    async def create_user(user: UserCreate, db: AsyncSession):
        result = await db.execute(select(User).where(User.email == user.email))
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = await hash_password(user.password)
        user.password = hashed_password

        new_user = User(**user.model_dump())
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return new_user
    
    @staticmethod
    async def get_me(current_username: str, db:AsyncSession):
        result = await db.execute(select(User).where(User.name == current_username))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    
    @staticmethod
    async def get_user(user_id: int, db: AsyncSession):
        result = await db.execute(select(User).where(User.user_id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        
        return user
    
    @staticmethod
    async def update_user_role(user_id: int, new_role: UserRoleUpdate, db:AsyncSession):

        valid_roles = ["regular", "admin"]
        if new_role.role not in valid_roles:
            raise HTTPException(status_code=400, detail="Invalid role")
        
        result = await db.execute(select(User).where(User.user_id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        await db.execute(update(User).where(User.user_id == user_id).values({"role": new_role.role}))
        await db.commit()
        await db.refresh(user)

        return user
    
    @staticmethod
    async def get_watch_history(user_id: int, db: AsyncSession):
        try:
            query = (
                select(
                    WatchHistory.id,
                    WatchHistory.watched_at,
                    WatchHistory.watch_count,
                    Movie.movie_id,
                    Movie.title,
                    Poster.image_path
                )
                .join(Movie, Movie.movie_id == WatchHistory.movie_id)
                .outerjoin(Poster, Poster.movie_id == Movie.movie_id)
                .where(WatchHistory.user_id == user_id)
                .order_by(WatchHistory.watched_at.desc())
            )

            result = await db.execute(query)
            rows = result.all()

            if not rows:
                raise HTTPException(status_code=404, detail="Watch history not found")

            history = []
            seen = set()

            for row in rows:
                (
                    history_id,
                    watched_at,
                    watch_count,
                    movie_id,
                    title,
                    poster_url
                ) = row

                if history_id in seen:
                    continue

                history.append({
                    "watched_at": watched_at,
                    "watch_count": watch_count,
                    "movie": {
                        "movie_id": movie_id,
                        "title": title,
                        "poster_url": poster_url
                    }
                })

                seen.add(history_id)

            return history

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching watch history: {str(e)}")

    
    @staticmethod
    async def add_to_watch_history(user_id: int, movie_id: int, db: AsyncSession):
        stmt = pg_insert(WatchHistory).values(
            user_id=user_id,
            movie_id=movie_id,
            watch_count=1,
            watched_at=datetime.now(timezone.utc)
        ).on_conflict_do_update(
            index_elements=['user_id', 'movie_id'],
            set_={
                "watch_count": WatchHistory.watch_count + 1,
                "watched_at": datetime.now(timezone.utc)
            }
        )

        try:
            await db.execute(stmt)
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Failed to add watch history")

        return {"message": "Watch history updated successfully"}