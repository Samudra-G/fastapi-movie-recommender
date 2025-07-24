import React from "react";
import { useRouter } from "next/router";
import  MovieListGenre from "../../../components/MovieListGenre";
import { motion } from "framer-motion";

const GenreMovies = () => {
  const router = useRouter();
  const { genre } = router.query;

  if (!genre) return null; // Wait for router to load

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <motion.h1
        className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text tracking-wide"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {genre} Movies
      </motion.h1>

      <MovieListGenre key={genre} genre={genre} />
    </div>
  );
};

export default GenreMovies;
