import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MovieList from "../components/MovieList";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { fetchMovies } from "../services/api";
import { debounce } from "lodash";

const genres = [
  "Action", "Music", "Foreign", "TV Movie", "Comedy", "Mystery", "Family",
  "Documentary", "Western", "History", "Science Fiction", "Romance", "Drama",
  "War", "Fantasy", "Horror", "Crime", "Adventure", "Animation", "Thriller"
];

const Home = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const debouncedFetchMovies = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }
      const results = await fetchMovies(searchTerm);
      setSearchResults(results.length > 0 ? results : []);
    }, 500),
    []
  );

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

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    navigate(`/movies/genre/${genre}`);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6 w-full">
      
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative p-6 w-[90%] max-w-3xl bg-white/10 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 text-center"
      >
        <motion.h1
          className="text-5xl font-bold tracking-tight text-blue-400"
          style={{ fontFamily: "Poppins, sans-serif" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Movie Seeker
        </motion.h1>
        <p className="text-gray-300 mt-2 text-lg font-light">
          Discover movies tailored just for you!
        </p>
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
            onChange={handleInputChange}
            className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg backdrop-blur-xl placeholder-gray-400"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400"
          >
            <Search size={22} />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {query.trim() !== "" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full bg-white/10 backdrop-blur-xl text-white p-3 rounded-lg shadow-lg z-10 mt-2 border border-white/20"
          >
            {searchResults.length > 0 ? (
              searchResults.map((movie) => (
                <p
                  key={movie.movie_id}
                  className="px-2 py-1 hover:bg-white/20 cursor-pointer transition"
                  onClick={() => handleMovieClick(movie.movie_id)}
                >
                  {movie.title}
                </p>
              ))
            ) : (
              <p className="px-2 py-1 text-gray-400 text-center">No Movies Found</p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Genre Chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-6 px-4 flex flex-wrap gap-2 justify-center"
      >
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedGenre === genre ? "bg-blue-500 text-white shadow-lg" : "bg-white/20 text-gray-200 hover:bg-white/30"
            }`}
          >
            {genre}
          </button>
        ))}
      </motion.div>

      {/* Movie List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full max-w-screen-xl px-4 mt-6"
      >
        <MovieList selectedGenre={selectedGenre} />
      </motion.div>

      {/* Cinematic Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-8 text-gray-300 text-lg text-center max-w-2xl px-4 font-light"
      >
        Movies move us like nothing else can, whether they’re scary, funny, dramatic, romantic,  
        or anywhere in between. So many titles, so much to experience.
      </motion.p>
    </div>
  );
};

export default Home;
