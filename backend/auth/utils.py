from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify(plain_passoword, hashed_password):
    return pwd_context.verify(plain_passoword, hashed_password)

def to_dict(obj):
    data = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        
        # Convert datetime fields to string
        if isinstance(value, datetime):
            value = value.isoformat()
        
        data[column.name] = value
    
    return data