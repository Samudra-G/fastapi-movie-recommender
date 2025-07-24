import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MovieList from "../components/MovieList";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { fetchMovies } from "../services/api";
import { debounce } from "lodash";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { fetchWatchHistory } from "../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const genres = [
  "Action",
  "Music",
  "Foreign",
  "TV Movie",
  "Comedy",
  "Mystery",
  "Family",
  "Documentary",
  "Western",
  "History",
  "Science Fiction",
  "Romance",
  "Drama",
  "War",
  "Fantasy",
  "Horror",
  "Crime",
  "Adventure",
  "Animation",
  "Thriller",
];

const Home = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
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
    setQuery(e.target.value);
    debouncedFetchMovies(e.target.value);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const data = await fetchWatchHistory();
      console.log("Fetched watch history:", data); 
      setWatchHistory(data);
    } catch (err) {
      console.error("Error loading watch history:", err);
      setWatchHistory([]);
    }
  };
  fetchHistory();
}, []);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Section */}
      <motion.div
        className="w-full max-w-4xl text-left mt-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl font-extrabold text-white">Movies</h1>
        <p className="text-lg text-gray-300 mt-2 font-medium">
          Movies move us like nothing else can, whether they’re scary, funny,
          dramatic, romantic or anywhere in-between. So many titles, so much to
          experience.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="relative w-[90%] max-w-lg mt-6"
        ref={searchRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search for movies..."
            value={query}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-blue-400 text-lg backdrop-blur-xl placeholder-gray-400"
          />
          <Search
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400"
            size={22}
          />
        </div>
        {query.trim() !== "" && (
          <motion.div
            className="absolute w-full bg-gray-800 p-3 rounded-lg shadow-lg z-10 mt-2 border border-gray-600"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >

            {searchResults.length > 0 ? (
              searchResults.map((movie) => (
                <p
                  key={movie.movie_id}
                  className="px-2 py-1 hover:bg-gray-700 cursor-pointer rounded-md transition"
                  onClick={() => handleMovieClick(movie.movie_id)}
                >
                  {movie.title}
                </p>

              ))
            ) : (
              <p className="px-2 py-1 text-gray-400 text-center">
                No Movies Found
              </p>
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.div className="mt-6 px-4 text-center">
        <p className="text-lg text-gray-300 font-medium">
          Explore a world of movies by genre – find your next favorite film!
        </p>
      </motion.div>

      {/* Genre Selection */}
      <motion.div className="mt-6 px-4 flex flex-wrap gap-2 justify-center">
        {genres.map((genre) => (
          <motion.button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedGenre === genre
                ? "bg-blue-500 text-white"
                : "bg-white/20 text-gray-200 hover:bg-white/30"
            }`}
            whileHover={{ scale: 1.1 }}
          >
            {genre}
          </motion.button>
        ))}
      </motion.div>
        {watchHistory.length > 0 && (
  <motion.div
    className="w-full max-w-screen-xl px-4 mt-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <h2 className="text-2xl font-bold mb-4 text-white">Your Watch History</h2>
    <Swiper
      modules={[Navigation]}
      spaceBetween={20}
      slidesPerView={2}
      navigation
      breakpoints={{
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
      }}
    >
      {watchHistory.map((entry) => (
        <SwiperSlide key={entry.movie.movie_id}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/10 rounded-xl overflow-hidden shadow-lg cursor-pointer"
            onClick={() => handleMovieClick(entry.movie.movie_id)}
          >
            <img
              src={entry.movie.poster_url}
              alt={entry.movie.title}
               className="w-full h-auto max-h-72 object-contain bg-black"
            />
            <div className="p-3 text-white">
              <h3 className="text-lg font-semibold truncate">{entry.movie.title}</h3>
              <p className="text-sm text-gray-400">
                Watched on {new Date(entry.watched_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        </SwiperSlide>
      ))}

    </Swiper>
  </motion.div>
)}

      {/* Recommended Movies */}
      <motion.div
        className="w-full max-w-screen-xl px-4 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">🔥 Recommended for You</h2>
        <MovieList mode="recommendations" />
      </motion.div>

      {/* All Movies */}
      <motion.div
        className="w-full max-w-screen-xl px-4 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">🎬 Explore All Movies</h2>
        <MovieList selectedGenre={selectedGenre} mode="all" />
      </motion.div>

      {/* Footer */}
      <footer className="w-full mt-12 py-6 text-center text-gray-400 border-t border-gray-700">
        <div className="flex justify-center gap-4 mb-2">
          <motion.div whileHover={{ scale: 1.2 }}>
            <FaFacebook
              size={24}
              className="cursor-pointer hover:text-white transition"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.2 }}>
            <FaTwitter
              size={24}
              className="cursor-pointer hover:text-white transition"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.2 }}>
            <FaInstagram
              size={24}
              className="cursor-pointer hover:text-white transition"
            />
          </motion.div>
        </div>
        <p className="text-sm">
          Movie Seeker &copy; {new Date().getFullYear()} | All Rights Reserved
        </p>
      </footer>
    </motion.div>
  );
};

export default Home;
