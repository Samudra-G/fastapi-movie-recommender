from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from backend.database.schemas import UserCreate, UserResponse, UserLogin, UserRoleUpdate
from backend.models.models import User
from backend.database.database import get_db
from backend.auth.utils import hash_password
from backend.database.schemas import TokenData
from backend.auth.oauth2 import get_current_user
from backend.auth.admin import admin_required

router = APIRouter(
    prefix="/users",
    tags= ["Users"] 
)

#add user
@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    user.password = hashed_password

    new_user = User(**user.model_dump())
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

#get personal data
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user), db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.name == current_user.name))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

#get user by id
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db),
              current_user: TokenData = Depends(get_current_user)):

    if current_user.id == user_id:
        pass
    else:
        admin_required(current_user)

    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    return user

#set user role
@router.put("/{user_id}/role", status_code=200)
async def update_user_role(user_id: int, new_role: UserRoleUpdate, db: AsyncSession = Depends(get_db), 
                     current_user: TokenData = Depends(admin_required)):
    
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

    return {"message": f"Admin {current_user.name} updated User {user.name}'s role to {new_role.role}"}