from fastapi import FastAPI
from backend.database.database import engine, Base, SessionLocal
from sqlalchemy.sql import text
from backend.models.models import User, Movie, Review, Poster, Recommendation
from backend.routers import movies, users, auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(movies.router)
app.include_router(users.router)
app.include_router(auth.router)

@app.get('/')
def read_root():
    return {"message":"Welcome to this API"}

@app.get('/test-db')
def test_db():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1")) #object -> text 
        return {"status":"Database Connected"}
    except Exception as e:
        return {"status":"Database Connection Failed","error":str(e)}
    finally:
        db.close()