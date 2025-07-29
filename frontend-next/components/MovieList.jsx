import { useEffect, useState } from "react";
import { fetchMovies, fetchUserProfile } from "../services/api";
import MovieCard from "./MovieCard";
import axios from "axios";
import { MovieCardSkeleton } from "./Skeleton";

// Utility function to shuffle movies
const shuffleArray = (array) => {
  const shuffled = Array.isArray(array) ? [...array] : [];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MovieList = ({ searchQuery = "", selectedGenre = "", mode = "all" }) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      try {
        if (mode === "recommendations") {
          const token = localStorage.getItem("token");

          if (!token) {
            console.warn("Guest user — no recommendations");
            setMovies([]);
            return;
          }

          const profile = await fetchUserProfile();
          if (!profile) {
            console.warn("No user profile — skipping recommendations");
            setMovies([]);
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
          const data = await fetchMovies(searchQuery, selectedGenre);
          const shuffled = shuffleArray(data);
          setMovies(shuffled);
        }
      } catch (err) {
        console.error("Error loading movies:", err.message || err);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [searchQuery, selectedGenre, mode]);

  if (!hasMounted) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {isLoading ? (
        Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
      ) : mode === "recommendations" && movies.length === 0 ? (
        <p className="text-white col-span-full">
          No recommendations available for guest users.
        </p>
      ) : movies.length > 0 ? (
        movies
          .slice(0, 12)
          .map((movie) => (
            <MovieCard key={movie.movie_id || movie.id} movie={movie} />
          ))
      ) : (
        <p className="text-white col-span-full">No results found.</p>
      )}
    </div>
  );
};

export default MovieList;
