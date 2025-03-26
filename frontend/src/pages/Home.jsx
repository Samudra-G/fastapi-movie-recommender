import React from "react";
import MovieList from "../components/MovieList";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6 w-full">
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
          Welcome to Movie Recommender 
        </motion.h1>
        <p className="text-gray-300 mt-2">Discover movies tailored just for you!</p>
      </motion.div>

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
