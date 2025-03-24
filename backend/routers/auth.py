from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_
from backend.database import database, schemas
from backend.models.models import User
from backend.services.user_services import UserService
from backend.services.recommendation_services import RecommendationService
from backend.auth import utils, oauth2
from sqlalchemy.future import select
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login")
@limiter.limit("10/minute")
async def login_user(request: Request, user_credentials: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(database.get_db)):

    try:
        stmt = select(User).where((or_(User.email == user_credentials.username, User.name == user_credentials.username)))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        
        is_valid = await utils.verify(user_credentials.password, user.password)
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        
        access_token = oauth2.create_access_token(data = {"user_id": user.user_id, "username": user.name, "role": user.role})

        await RecommendationService.ensure_recommendations_exist(user.user_id, db) #type:ignore

        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/signup", response_model=schemas.UserResponse, status_code=201)    
async def signup(request: Request, user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    return await UserService.create_user(user, db)

@router.get("/me", response_model=schemas.UserResponse)
@limiter.limit("20/minute")
async def get_me(request: Request, current_user: schemas.TokenData = Depends(oauth2.get_current_user),
                  db: AsyncSession = Depends(database.get_db)):
    if current_user.name:
        return await UserService.get_me(current_user.name, db)