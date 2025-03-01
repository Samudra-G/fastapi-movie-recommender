from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database.schemas import UserCreate, UserResponse, UserLogin, UserRoleUpdate
from backend.database.database import get_db
from backend.database.schemas import TokenData
from backend.auth.oauth2 import get_current_user
from backend.auth.admin import admin_required
from backend.services.user_services import UserService

router = APIRouter(
    prefix="/users",
    tags= ["Users"] 
)

#add user
@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await UserService.create_user(user, db)

#get personal data
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.name:
        return await UserService.get_me(current_user.name, db)

#get user by id
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db),
              current_user: TokenData = Depends(get_current_user)):
    if current_user.id != user_id:
        admin_required(current_user)

    return await UserService.get_user(user_id, db)

#set user role
@router.put("/{user_id}/role", status_code=200)
async def update_user_role(user_id: int, new_role: UserRoleUpdate, db: AsyncSession = Depends(get_db), 
                     current_user: TokenData = Depends(admin_required)):

    updated_user = await UserService.update_user_role(user_id, new_role, db)

    return {"message": f"Admin {current_user.name} updated User {updated_user.name}'s role to {new_role.role}"}