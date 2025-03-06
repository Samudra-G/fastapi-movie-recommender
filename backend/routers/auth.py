from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_
from backend.database import database, schemas
from backend.models.models import User
from backend.auth import utils, oauth2
from sqlalchemy.future import select
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    tags=["Authentication"]
)

@router.post("/login")
@limiter.limit("5/minute")
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

        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")