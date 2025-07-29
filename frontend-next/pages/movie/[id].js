import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  fetchMovieById,
  fetchSimilarMovies,
  addToWatchHistory,
} from "../../services/api";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import Link from "next/link";

const MovieDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  useEffect(() => {
    if (!id || isNaN(id)) return;

    // Reset previous similar movie state
    setSimilarMovies([]);
    setShowSimilar(false);

    const getMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMovieById(id);
        if (!data) throw new Error("Movie not found");
        setMovie(data);

        const token = localStorage.getItem("token");
        if (token) await addToWatchHistory(id);
      } catch (err) {
        console.error("Movie Fetch Error:", err);
        setError("Failed to fetch movie details.");
      } finally {
        setLoading(false);
      }
    };

    getMovie();
  }, [id]);

  const loadSimilarMovies = async () => {
    setSimilarLoading(true);
    setShowSimilar(true);
    try {
      const data = await fetchSimilarMovies(id);
      setSimilarMovies(data || []);
    } catch (err) {
      console.error("Error fetching similar movies:", err);
    } finally {
      setSimilarLoading(false);
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading movie...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!movie)
    return <p className="text-center text-gray-500">No movie data found.</p>;

  const titleSize = movie.title?.length > 30 ? "text-xl" : "text-2xl";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Pulsing gradient glass layer */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-30 animate-pulse blur-3xl" />

      {/* Main content glass panel */}
      <div className="relative z-10 bg-[#1e1e1e]/60 backdrop-blur-lg text-white px-6 pt-28 pb-16">
        <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_4px_rgba(99,102,241,0.3)] flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.img
            src={movie.poster_url || "/default-poster.jpg"}
            alt={movie.title}
            className="w-full md:w-[300px] h-[400px] object-cover rounded-2xl shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Movie Info */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className={`${titleSize} font-bold text-blue-400 mb-2`}>
              {movie.title}
            </h1>
            <p className="text-gray-400 text-sm mb-1">
              {movie.genre || "Unknown Genre"} •{" "}
              {new Date(movie.release_date).toDateString()}
            </p>

            <div className="flex items-center gap-4 text-slate-300 text-sm mb-2">
              {movie.rating !== null && (
                <span>⭐ {movie.rating.toFixed(1)}</span>
              )}
              {movie.vote_count !== null && (
                <span>👥 {movie.vote_count} votes</span>
              )}
            </div>

            <p className="text-gray-300 text-sm mb-4">
              {movie.overview || "No overview available."}
            </p>

            <motion.button
              className="w-fit bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Trailer
            </motion.button>
          </div>
        </div>

        {/* Show Similar Button */}
        <div className="max-w-5xl mx-auto text-center mt-12">
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadSimilarMovies}
          >
            Show Similar Movies
          </motion.button>

          {showSimilar && similarLoading && (
            <p className="mt-2 text-gray-400 text-sm">
              Fetching similar movies...
            </p>
          )}
        </div>

        {/* Similar Movie Swiper */}
        {showSimilar && !similarLoading && similarMovies.length > 0 && (
          <div className="mt-8 w-full max-w-5xl mx-auto">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={2}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="rounded-lg overflow-hidden"
            >
              {similarMovies.map((simMovie) => (
                <SwiperSlide
                  key={simMovie.movie_id}
                  className="bg-[#1e1e1e] rounded-xl shadow-md p-3"
                >
                  <Link href={`/movie/${simMovie.movie_id}`} className="block">
                    <motion.img
                      src={simMovie.poster_url || "/default-poster.jpg"}
                      alt={simMovie.title}
                      className="w-full h-[250px] object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                    />
                    <p className="mt-2 text-sm text-gray-300 font-medium text-center">
                      {simMovie.title.length > 20
                        ? simMovie.title.slice(0, 17) + "..."
                        : simMovie.title}
                    </p>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
