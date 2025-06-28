from fastapi import APIRouter, Depends, BackgroundTasks
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database.schemas import UserResponse, UserRoleUpdate, WatchHistoryOut
from backend.database.database import get_db, AsyncSessionLocal
from backend.database.schemas import TokenData
from backend.auth.oauth2 import get_current_user
from backend.auth.admin import admin_required
from backend.services.user_services import UserService
from backend.services.recommendation_services import RecommendationService
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/users",
    tags= ["Users"] 
)

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

# Generate recommendations
@router.post("/{user_id}/recommendations", status_code=201)
async def generate_recommendations(user_id: int, db: AsyncSession = Depends(get_db), 
                                    current_user: TokenData = Depends(get_current_user), top_n: int = 12):
    return await RecommendationService.generate_recommendations(user_id, db, top_n)

# Get recommendations
@router.get("/{user_id}/recommendations")
async def get_user_recommendations(user_id: int, db: AsyncSession = Depends(get_db), top_n: int = 12):
    return await RecommendationService.get_user_recommendations(user_id, db, top_n)

#Background task job
async def generate_recommendations_bg(user_id: int):
    async with AsyncSessionLocal() as db:
        try:
            await RecommendationService.generate_recommendations(user_id, db)
        except Exception as e:
            print(f"Background generation failed for user {user_id}: {e}")

@router.post("/me/watch/{movie_id}")
async def add_watch_history(
    movie_id: int, background_tasks: BackgroundTasks,
    current_user: TokenData = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.id is None:
        raise ValueError("User ID is missing in token data.")
    
    await UserService.add_to_watch_history(current_user.id, movie_id, db)
    background_tasks.add_task(generate_recommendations_bg, current_user.id)

    return {"message": "Watch history updated. Recommendations are being refreshed in the background."}

@router.get("/me/history", response_model=List[WatchHistoryOut])
async def get_watch_history(current_user: TokenData = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.id is None:
        raise ValueError("User ID is missing in token data.")
    return await UserService.get_watch_history(current_user.id, db) 

@router.post("/me/watch/{movie_id}/refresh", status_code=200)
async def update_watch_and_get_recommendations(
    movie_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.id is None:
        raise ValueError("User ID is missing")

    await UserService.add_to_watch_history(current_user.id, movie_id, db)
    await RecommendationService.generate_recommendations(current_user.id, db)
    
    return await RecommendationService.get_user_recommendations(current_user.id, db)