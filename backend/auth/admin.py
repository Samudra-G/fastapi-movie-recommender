from fastapi import Depends, HTTPException
from .oauth2 import get_current_user
from backend.database.schemas import TokenData

def admin_required(current_user: TokenData = Depends(get_current_user)):
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin priviledge required.")
    
    return current_user