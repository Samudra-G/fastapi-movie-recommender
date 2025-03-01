from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from fastapi import HTTPException
from backend.models.models import User
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