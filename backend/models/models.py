from backend.database.database  import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text, DateTime, Date
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from datetime import datetime
from pgvector.sqlalchemy import VECTOR


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="regular")

    # Relationships
    reviews = relationship("Review", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    watch_history = relationship("WatchHistory", back_populates="user", cascade="all, delete")

class Movie(Base):
    __tablename__ = "movies"

    movie_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    genre = Column(String, nullable=True)
    release_date = Column(Date, nullable=True)
    vote_average = Column(Float, nullable=False, default=0.0)  # IMDb rating / user votes
    vote_count = Column(Integer, nullable=False, default=0)  # Number of votes
    runtime = Column(Integer, nullable=True)  # Movie duration in minutes
    embedding = Column(VECTOR(768))
    overview = Column(Text, nullable=True)
    tmdb_id = Column(Integer, nullable=True, unique=True)

    # Relationships
    reviews = relationship("Review", back_populates="movie")
    posters = relationship("Poster", back_populates="movie")
    recommendations = relationship("Recommendation", back_populates="movie")
    genres = relationship("Genre", secondary="movie_genre", back_populates="movies")
    watch_history = relationship("WatchHistory", back_populates="movie", cascade="all, delete")

class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)

    #Relationships
    movies = relationship("Movie", secondary="movie_genre", back_populates="genres")

class MovieGenre(Base):
    __tablename__ = "movie_genre"

    movie_id = Column(Integer, ForeignKey("movies.movie_id", ondelete="CASCADE"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genres.id", ondelete="CASCADE"), primary_key=True)

class Review(Base):
    __tablename__ = "reviews"
    
    review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True)
    movie_id = Column(Integer, ForeignKey("movies.movie_id", ondelete="CASCADE"), nullable=False)
    review_text = Column(Text, nullable=True) #only user reviews
    sentiment = Column(Float(precision=2), nullable=True, index=True) #sentiments range from -1 to +1 from imdb    
    source = Column(String, default="user", index=True) #user or imdb
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

     # Relationships
    user = relationship("User", back_populates="reviews")
    movie = relationship("Movie", back_populates="reviews")

class Poster(Base):
    __tablename__ = "posters"
    
    poster_id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.movie_id"), nullable=False)
    image_path = Column(String, nullable=False)
    embedding = Column(VECTOR(768))

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

class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.movie_id", ondelete="CASCADE"), nullable=False)
    watched_at = Column(DateTime, server_default=func.now())
    watch_count = Column(Integer, default=1)

    # Relationships
    user = relationship("User", back_populates="watch_history")
    movie = relationship("Movie", back_populates="watch_history")