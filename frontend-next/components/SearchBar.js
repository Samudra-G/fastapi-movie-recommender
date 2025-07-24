"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { fetchMovies } from "../services/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const router = useRouter();

  const debouncedFetchMovies = useCallback(
    debounce(async (q) => {
      if (!q.trim()) return setResults([]);
      const data = await fetchMovies(q);
      setResults(data.length > 0 ? data : []);
    }, 500),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedFetchMovies(e.target.value);
  };

  const handleMovieClick = (id) => {
    setQuery("");
    setResults([]);
    router.push(`/movie/${id}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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
          onChange={handleChange}
          className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-blue-400 text-lg backdrop-blur-xl placeholder-gray-400"
        />
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400" size={22} />
      </div>

      {query.trim() !== "" && (
        <motion.div
          className="absolute w-full bg-gray-800 p-3 rounded-lg shadow-lg z-10 mt-2 border border-gray-600"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {results.length > 0 ? (
            results.map((movie) => (
              <p
                key={movie.movie_id}
                className="px-2 py-1 hover:bg-gray-700 cursor-pointer rounded-md transition"
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
  );
}
