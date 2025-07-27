"use client";
import React from "react";
import { useRouter } from "next/router";
import MovieListGenre from "../../../components/MovieListGenre";
import { motion } from "framer-motion";

const GenreMovies = () => {
  const router = useRouter();
  const { genre } = router.query;

  if (!genre) return null; // Wait for router to load

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white pt-28 pb-10">
      {/* Glassmorphic header */}
      <motion.div
        className="max-w-4xl mx-auto mb-10 rounded-2xl px-6 py-4 backdrop-blur-md bg-white/5 border border-white/10 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text tracking-wide">
          {genre} movies
        </h1>
      </motion.div>

      {/* 🔧 Wrap in max-w container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <MovieListGenre key={genre} genre={genre} />
      </div>
    </div>
  );
};

export default GenreMovies;
