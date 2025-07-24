"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

const genres = [
  "Action", "Music", "Foreign", "TV Movie", "Comedy", "Mystery", "Family",
  "Documentary", "Western", "History", "Science Fiction", "Romance",
  "Drama", "War", "Fantasy", "Horror", "Crime", "Adventure", "Animation", "Thriller",
];

export default function GenreSelector({ selectedGenre }) {
  const router = useRouter();

  const handleGenreClick = (genre) => {
    router.push(`/movies/genre/${genre}`);
  };

  return (
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
  );
}
