import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div
      className="movie-card w-56 p-3 bg-gray-800 rounded-2xl shadow-md text-white cursor-pointer hover:scale-105 transition-transform"
      onClick={() => navigate(`/movie/${movie.movie_id}`)}
    >
      <img 
        src={movie.poster_url} 
        alt={movie.title} 
        className="w-full h-80 object-cover rounded-lg mb-2"
      />
      <h3 className="text-lg font-bold truncate">{movie.title}</h3>
      <p className="text-xs text-gray-400">Genre: {movie.genre}</p>
      <p className="text-xs text-gray-400">Rating: {movie.rating || "Not Rated"}</p>
    </div>
  );
};

export default MovieCard;
