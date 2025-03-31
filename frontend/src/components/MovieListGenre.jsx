import React, { useState, useEffect } from "react";
import { fetchMovies } from "../services/api";
import MovieCard from "./MovieCard";

const MovieListGenre = ({ genre }) => {
  const [allMovies, setAllMovies] = useState([]); 
  const [displayedMovies, setDisplayedMovies] = useState([]); 
  const [page, setPage] = useState(1);
  const perPage = 12; 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAllMovies([]); // Reset on genre change
    setDisplayedMovies([]); 
    setPage(1);
  }, [genre]);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      console.log(`🎬 Fetching 100 movies for genre: ${genre}`);

      try {
        const response = await fetchMovies("", genre, 1, 100); // Fetch 100 movies
        console.log("📡 API Response:", response);

        let moviesArray = response?.movies || response?.data?.movies || response || [];

        if (Array.isArray(moviesArray) && moviesArray.length > 0) {
          setAllMovies(moviesArray);
          setPage(1); 
        } else {
          console.warn(" No valid movies found in API response.");
          setAllMovies([]);
        }
      } catch (error) {
        console.error(" Error fetching movies:", error);
        setAllMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [genre]);

  // Update displayed movies when `allMovies` or `page` changes
  useEffect(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    setDisplayedMovies(allMovies.slice(startIndex, endIndex));
  }, [allMovies, page]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {loading ? (
        <p className="text-center text-gray-400">Loading movies...</p>
      ) : displayedMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedMovies.map((movie) => (
              <MovieCard key={movie.movie_id || movie.id} movie={movie} />
            ))}
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <button
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-lg">Page {page} of {Math.ceil(allMovies.length / perPage)}</span>
            <button
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              onClick={() => setPage((prev) => (prev < Math.ceil(allMovies.length / perPage) ? prev + 1 : prev))}
              disabled={page >= Math.ceil(allMovies.length / perPage)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400">No movies found for this genre.</p>
      )}
    </div>
  );
};

export default MovieListGenre;
