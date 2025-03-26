import React, { useEffect, useState } from "react";
import { fetchMovies } from "../services/api";
import MovieCard from "./MovieCard";

const MovieList = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      const data = await fetchMovies();
      setMovies(data);
    };
    loadMovies();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Movies</h2>
      <div className="grid grid-cols-4 gap-6">
        {movies.slice(0, 12).map((movie) => (
          <MovieCard key={movie.movie_id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default MovieList;
