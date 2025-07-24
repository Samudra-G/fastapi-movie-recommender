import asyncio
import numpy as np
from passlib.context import CryptContext
from datetime import datetime, date

pwd_context = CryptContext(schemes=["bcrypt"],
                           bcrypt__rounds=10, deprecated="auto")

async def hash_password(password: str):
    return await asyncio.to_thread(pwd_context.hash, password) 

async def verify(plain_password, hashed_password):
    return await asyncio.to_thread(pwd_context.verify, plain_password, hashed_password)

def to_dict(obj):
    data = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        
        # Convert datetime fields to string
        if isinstance(value, datetime):
            value = value.isoformat()
        # Convert date fields (like release_date) to "YYYY-MM-DD"
        elif isinstance(value, date):
            value = value.strftime("%Y-%m-%d")
        # Convert NumPy arrays (like embedding) to lists
        elif isinstance(value, np.ndarray):
            value = value.tolist()

        data[column.name] = value
    
    return data