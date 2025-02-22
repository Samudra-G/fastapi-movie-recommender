import os
from dotenv import load_dotenv
from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from typing import cast, Optional
from backend.database.schemas import TokenData
from fastapi import HTTPException, Depends
from fastapi.security  import OAuth2PasswordBearer

load_dotenv()
SECRET_KEY = cast(str, os.getenv("SECRET_KEY"))
ALGORITHM = cast(str, os.getenv("ALGORITHM"))


if SECRET_KEY is None:
    raise ValueError("SECRET_KEY environment variable is not set")
if ALGORITHM is None:
    raise ValueError("ALGORITHM environment variable is not set")

ACCESS_TOKEN_EXPIRATION_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRATION_MINUTES", 30))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

def create_access_token(data: dict) -> str:

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def verify_access_token(token: str, credentials_exception):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        name: Optional[str] = payload.get("username")
        role: Optional[str] = payload.get("role")

        if name is None or role is None:
            raise credentials_exception
    
        token_data = TokenData(name= name, role= role)
        return token_data
    
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    
    except JWTError:
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme)):

    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials", 
                                         headers={"WWW-Authenticate":"Bearer"})
    
    return verify_access_token(token, credentials_exception)