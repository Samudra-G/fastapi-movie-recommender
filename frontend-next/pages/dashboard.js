import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchMovies } from "../services/api";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const Dashboard = () => {
  const [randomMovie, setRandomMovie] = useState(null);
  const [isClient, setIsClient] = useState(false); // hydration guard
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // mark hydration complete
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadRandomMovie = async () => {
      const movies = await fetchMovies("", "", 1, 100);
      if (movies?.length) {
        const random = movies[Math.floor(Math.random() * movies.length)];

        // Extra poster check
        if (
          random.poster_url &&
          typeof random.poster_url === "string" &&
          random.poster_url.trim().startsWith("http")
        ) {
          setRandomMovie(random);
        } else {
          console.warn("Skipped invalid poster_url:", random);
        }
      }
    };

    loadRandomMovie();
  }, [isClient]);

  // Still loading or movie not ready
  if (!isClient || !randomMovie) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white flex items-center justify-center px-6 pt-18">
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
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl w-full max-w-xs h-auto mx-auto 
     shadow-[0_10px_20px_rgba(0,0,0,0.6),_0_6px_6px_rgba(0,0,0,0.5)] 
     border border-slate-800 
     hover:shadow-[0_12px_28px_rgba(0,0,0,0.7),_0_8px_8px_rgba(0,0,0,0.5)] 
     transition-all duration-300 ease-in-out"
        />

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center md:text-left"
        >
          <h1
            className="text-5xl font-bold tracking-wide mb-2"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              textShadow: "0 0 10px rgba(255,255,255,0.2)",
            }}
          >
            {randomMovie.title?.toUpperCase()}
          </h1>

          {/* Rating and Vote Count */}
          <div className="flex items-center justify-center md:justify-start gap-4 text-slate-300 text-base mb-4">
            {randomMovie.rating !== null && (
              <span>⭐ {randomMovie.rating.toFixed(1)}</span>
            )}
            {randomMovie.vote_count !== null && (
              <span>👥 {randomMovie.vote_count} votes</span>
            )}
          </div>

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
