"use client";
import { useEffect, useState } from "react";
import { fetchWatchHistory } from "../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

export default function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const data = await fetchWatchHistory();
        setHistory(data);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Error fetching watch history:", err);
        setIsLoggedIn(false);
      }
    };

    fetchData();
  }, []);

  if (!isLoggedIn || history.length === 0) return null;

  return (
    <motion.div
      className="w-full max-w-screen-xl px-4 mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Continue Browsing</h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
      >
        {history.map((entry) => (
          <SwiperSlide key={entry.movie.movie_id}>
            <motion.div
              whileHover={{ scale: 1.01 }} // Slight outer scale for the card
              className="rounded-xl overflow-hidden cursor-pointer relative group transition-transform duration-300"
              onClick={() => router.push(`/movie/${entry.movie.movie_id}`)}
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={entry.movie.poster_url}
                  alt={entry.movie.title}
                  className="w-full h-[250px] object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Watched on {new Date(entry.watched_at).toLocaleDateString()}
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
