import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MovieList from "../components/MovieList";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { fetchMovies } from "../services/api"; // ✅ Corrected Import
import { debounce } from "lodash";

const Home = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Debounce search function
  const debouncedFetchMovies = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }
      const results = await fetchMovies(searchTerm); // ✅ Use fetchMovies
      setSearchResults(results);
    }, 500),
    []
  );

  // ✅ Handle input change and trigger debounced search
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedFetchMovies(newQuery);
  };

  const handleMovieClick = (movieId) => {
    setSearchResults([]);
    setQuery("");
    navigate(`/movie/${movieId}`);
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6 w-full">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative p-6 w-[90%] max-w-3xl bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl border border-white/20 text-center"
      >
        <motion.h1
          className="text-4xl font-extrabold text-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Movie Seeker
        </motion.h1>
        <p className="text-gray-300 mt-2">Discover movies tailored just for you!</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-[90%] max-w-lg mt-6"
        ref={searchRef}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search for movies..."
            value={query}
            onChange={handleInputChange} // ✅ Debounced search triggered here
            className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400"
          >
            <Search size={22} />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full bg-gray-800 text-white p-3 rounded-lg shadow-lg z-10 mt-2"
          >
            {searchResults.map((movie) => (
              <p
                key={movie.movie_id}
                className="px-2 py-1 hover:bg-gray-700 cursor-pointer transition"
                onClick={() => handleMovieClick(movie.movie_id)}
              >
                {movie.title}
              </p>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Movie List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full max-w-screen-xl px-4 mt-6"
      >
        <MovieList />
      </motion.div>
    </div>
  );
};

export default Home;
