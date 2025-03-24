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
    <div>
      <h2>Movies</h2>
      <div className="movie-list">
        {movies.map((movie) => (
          <MovieCard key={movie.movie_id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default MovieList;
