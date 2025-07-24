"use client";
import React from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

const MovieCard = ({ movie }) => {
  const router = useRouter();

  if (!movie || !movie.movie_id) return null;

  return (
    <div
      className="movie-card w-56 p-3 bg-gray-800 rounded-2xl shadow-md text-white cursor-pointer hover:scale-105 transition-transform"
      onClick={() => {
        if (movie?.movie_id) {
          router.push(`/movie/${movie.movie_id}`);
        }
      }}
    >
      <img 
        src={movie.poster_url} 
        onError={(e) => (e.target.src = "/fallback.png")}
        alt={movie.title} 
        className="w-full h-80 object-cover rounded-lg mb-2"
      />
      <h3 className="text-lg font-bold truncate">{movie.title}</h3>
      <p className="text-xs text-gray-400">Genre: {movie.genre}</p>
      <p className="text-xs text-gray-400">Rating: {movie.rating || "Not Rated"}</p>
    </div>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    movie_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    poster_url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    genre: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default MovieCard;
