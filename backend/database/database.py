import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from typing import AsyncGenerator

#Loading environment variables
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set or invalid")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=False, pool_size=20, max_overflow=10)

AsyncSessionLocal = async_sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session