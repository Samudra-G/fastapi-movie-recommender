import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchMovies } from "../services/api";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const Dashboard = () => {
  const [randomMovie, setRandomMovie] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadRandomMovie = async () => {
      const movies = await fetchMovies("", "", 1, 100);
      if (movies?.length) {
        const random = movies[Math.floor(Math.random() * movies.length)];
        setRandomMovie(random);
      }
    };
    loadRandomMovie();
  }, []);

  if (!randomMovie) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white flex items-center justify-center px-6">
      {/* Blurred background */}
      <img
        src={randomMovie.poster_url}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover blur-lg opacity-30 scale-110"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Poster */}
        <motion.img
          src={randomMovie.poster_url}
          alt={randomMovie.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="rounded-xl w-full max-w-xs mx-auto shadow-xl"
        />

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center md:text-left"
        >
          <h1
            className="text-5xl font-bold mb-4 tracking-wide"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              textShadow: "0 0 10px rgba(255,255,255,0.2)",
            }}
          >
            {randomMovie.title?.toUpperCase()}
          </h1>

          <p className="text-lg text-slate-300 mb-6">
            <Typewriter
              words={[
                "Movies move us like nothing else can.",
                "They transport us to other worlds...",
                "Spark new ideas and rekindle old ones.",
              ]}
              loop={false}
              cursor
              cursorStyle="|"
              typeSpeed={50}
              deleteSpeed={30}
              delaySpeed={3000}
            />
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/movie/${randomMovie.movie_id}`)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg font-semibold shadow-md transition"
          >
            🎬 Watch Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
