import React, { useEffect, useState } from "react";
import { fetchMovies } from "../services/api";
import MovieCard from "./MovieCard";

const MovieList = ({ searchQuery }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      const data = await fetchMovies(searchQuery);  
      setMovies(data);
    };
    loadMovies();
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Your next watch</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.length > 0 ? (
          movies.slice(0, 12).map((movie) => (
            <MovieCard key={movie.movie_id || movie.id} movie={movie} /> 
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default MovieList;
