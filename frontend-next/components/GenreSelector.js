"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

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

export default function GenreSelector({ selectedGenre }) {
  const router = useRouter();

  const handleGenreClick = (genre) => {
    router.push(`/movies/genre/${genre.toLowerCase()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full max-w-5xl mx-auto mt-8 px-4"
    >
      <div className="flex flex-wrap justify-center gap-3">
        {genres.map((genre) => (
          <motion.button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition backdrop-blur-sm border border-white/10 shadow-sm hover:shadow-md ${
              selectedGenre === genre
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-gray-200 hover:bg-white/20"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {genre}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
