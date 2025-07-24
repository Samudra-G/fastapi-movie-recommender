import React, { useEffect, useState } from "react";
import { fetchMovies, fetchUserProfile } from "../services/api";
import MovieCard from "./MovieCard";
import axios from "axios";

const MovieList = ({ searchQuery = "", selectedGenre = "", mode = "all" }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        if (mode === "recommendations") {
          const profile = await fetchUserProfile(); // fetch /auth/me
          const userId = profile.user_id;
          const res = await axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/users/${userId}/recommendations?top_n=12`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("Fetching recs for user:", userId);
          setMovies(res.data.recommendations);
        } else {
          const data = await fetchMovies(searchQuery, selectedGenre);
          setMovies(data);
        }
      } catch (err) {
        console.error("Failed to load movies:", err);
        setMovies([]);
      }
    };

    loadMovies();
  }, [searchQuery, selectedGenre, mode]);

  useEffect(() => {
    console.log("Movies state updated:", movies);
  }, [movies]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.length > 0 ? (
        movies
          .slice(0, 12)
          .map((movie) => (
            <MovieCard key={movie.movie_id || movie.id} movie={movie} />
          ))
      ) : (
        <p className="text-white">No results found</p>
      )}
    </div>
  );
};

export default MovieList;
