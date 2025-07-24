import React from "react";
import { useParams } from "react-router-dom";
import MovieListGenre from "../components/MovieListGenre";
import { motion } from "framer-motion";

const GenreMovies = () => {
  const { genre } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      {/* Animated heading */}
      <motion.h1 
        className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text tracking-wide"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {genre} Movies
      </motion.h1>

      {/* Movie list (forces re-render on genre change) */}
      <MovieListGenre key={genre} genre={genre} />
    </div>
  );
};

export default GenreMovies;
