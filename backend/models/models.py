from backend.database.database  import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    reviews = relationship("Review", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class Movie(Base):
    __tablename__ = "movies"

    movie_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    genre = Column(String, nullable=True)
    release_date = Column(DateTime, nullable=True)
    embedding = Column(Text, nullable=True)

    # Relationships
    reviews = relationship("Review", back_populates="movie")
    posters = relationship("Poster", back_populates="movie")
    recommendations = relationship("Recommendation", back_populates="movie")

class Review(Base):
    __tablename__ = "reviews"
    
    review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.movie_id"), nullable=False)
    text = Column(Text, nullable=False)
    sentiment = Column(Float, nullable=True) #sentiments range from -1 to +1
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

     # Relationships
    user = relationship("User", back_populates="reviews")
    movie = relationship("Movie", back_populates="reviews")

class Poster(Base):
    __tablename__ = "posters"
    
    poster_id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.movie_id"), nullable=False)
    image_path = Column(String, nullable=False)
    embedding = Column(Text, nullable=True)

    # Relationships
    movie = relationship("Movie", back_populates="posters")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    rec_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.movie_id"), nullable=False)
    score = Column(Float, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="recommendations")
    movie = relationship("Movie", back_populates="recommendations")
