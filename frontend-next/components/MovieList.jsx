import { useEffect, useState } from "react";
import { fetchMovies, fetchUserProfile } from "../services/api";
import MovieCard from "./MovieCard";
import axios from "axios";

// Utility function to shuffle movies
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MovieList = ({ searchQuery = "", selectedGenre = "", mode = "all" }) => {
  const [movies, setMovies] = useState(null); // null = unknown, [] = empty

  useEffect(() => {
    const loadMovies = async () => {
      try {
        if (mode === "recommendations") {
          const token = localStorage.getItem("token");

          if (!token) {
            console.warn("Guest user — no recommendations");
            setMovies(null); // explicitly means no recs for guest
            return;
          }

          const profile = await fetchUserProfile();
          if (!profile) {
            console.warn("No user profile — skipping recommendations");
            setMovies(null);
            return;
          }

          const userId = profile.user_id || profile.id;
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/recommendations?top_n=12`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Fetched recommendations for user:", userId);
          setMovies(res.data.recommendations || []);
        } else {
          // For all or genre/search
          const data = await fetchMovies(searchQuery, selectedGenre);
          const shuffled = shuffleArray(data || []);
          setMovies(shuffled);
        }
      } catch (err) {
        console.error("Error loading movies:", err.message || err);
        setMovies([]); // fail-safe
      }
    };

    loadMovies();
  }, [searchQuery, selectedGenre, mode]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {mode === "recommendations" && movies === null ? (
        <p className="text-white col-span-full">
          No recommendations available for guest users.
        </p>
      ) : movies && movies.length > 0 ? (
        movies.slice(0, 12).map((movie) => (
          <MovieCard key={movie.movie_id || movie.id} movie={movie} />
        ))
      ) : (
        <p className="text-white col-span-full">No results found.</p>
      )}
    </div>
  );
};

export default MovieList;
