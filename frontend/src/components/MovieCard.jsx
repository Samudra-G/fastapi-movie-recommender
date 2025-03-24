import React from 'react';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <h3>{movie.title}</h3>
      <p>Genre: {movie.genre}</p>
      <p>Rating: {movie.rating || "Not Rated"}</p>
    </div>
  );
};

export default MovieCard;
