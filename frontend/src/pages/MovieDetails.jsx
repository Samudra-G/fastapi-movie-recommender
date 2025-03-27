import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovieById, fetchSimilarMovies } from "../services/api";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMovie = async () => {
      try {
        const data = await fetchMovieById(id);
        console.log("Fetched movie data:", data);
        setMovie(data);

        // Fetch similar movies
        const similarData = await fetchSimilarMovies(id);
        console.log("Fetched similar movies:", similarData);
        setSimilarMovies(similarData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch movie details.");
      } finally {
        setLoading(false);
      }
    };

    getMovie();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading movie...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!movie) return <p className="text-center text-gray-500">No movie data found.</p>;

  // Adjust title size dynamically based on length
  const titleSize = movie.title?.length > 30 ? "text-xl" : "text-2xl";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
        
        {/* Movie Poster */}
        <motion.img 
          src={movie.poster_url || "/default-poster.jpg"} 
          alt={movie.title} 
          className="w-[200px] h-[300px] object-cover rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Movie Details */}
        <div className="flex flex-col justify-center">
          <h1 className={`${titleSize} font-bold text-blue-400`}>{movie.title}</h1>
          <p className="text-gray-400 text-sm">
            {movie.genre || "Unknown Genre"} | {new Date(movie.release_date).toDateString()}
          </p>
          <p className="mt-4 text-gray-300 text-sm">{movie.overview || "No overview available."}</p>

          <motion.button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Trailer
          </motion.button>
        </div>
      </div>

      {/* Swiper for Similar Movies */}
      {similarMovies.length > 0 ? (
        <div className="mt-10 w-full max-w-4xl">
          <h2 className="text-xl font-bold text-gray-300 mb-4">Movies you may also like...</h2>
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
              <SwiperSlide key={simMovie.movie_id} className="bg-gray-700 p-3 rounded-lg">
                <Link to={`/movie/${simMovie.movie_id}`} className="block">
                  <motion.img 
                    src={simMovie.poster_url || "/default-poster.jpg"} 
                    alt={simMovie.title} 
                    className="w-full h-[250px] object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                  />
                  <p className="mt-2 text-sm text-gray-300 font-medium text-center">
                    {simMovie.title.length > 20 ? simMovie.title.slice(0, 17) + "..." : simMovie.title}
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <p className="mt-6 text-gray-400">No similar movies found.</p>
      )}
    </div>
  );
};

export default MovieDetails;
