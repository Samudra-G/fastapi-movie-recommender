from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
def create_user(user: UserCreate, db: Session = Depends(get_db)):


    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    user.password = hashed_password

    new_user = User(**user.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

#get personal data
@router.get("/me", response_model=UserResponse)
def get_me(current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.name == current_user.name).first()  # Assuming `name` stores the email
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

#get user by id
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db),
              current_user: TokenData = Depends(get_current_user)):

    if current_user.id == user_id:
        pass
    else:
        admin_required(current_user)

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    return user

#set user role
@router.put("/{user_id}/role", status_code=200)
def update_user_role(user_id: int, new_role: UserRoleUpdate, db: Session = Depends(get_db), 
                     current_user: TokenData = Depends(admin_required)):
    
    valid_roles = ["regular", "admin"]
    if new_role.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.query(User).filter(User.user_id == user_id).update({"role": new_role.role})
    db.commit()
    db.refresh(user)

    return {"message": f"Admin {current_user.name} updated User {user.name}'s role to {new_role.role}"}