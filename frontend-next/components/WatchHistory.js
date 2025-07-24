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
      <h2 className="text-2xl font-bold mb-4 text-white">Your Watch History</h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={2}
        navigation
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {history.map((entry) => (
          <SwiperSlide key={entry.movie.movie_id}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white/10 rounded-xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => router.push(`/movie/${entry.movie.movie_id}`)}
            >
              <img
                src={entry.movie.poster_url}
                alt={entry.movie.title}
                className="w-full h-auto max-h-72 object-contain bg-black"
              />
              <div className="p-3 text-white">
                <h3 className="text-lg font-semibold truncate">{entry.movie.title}</h3>
                <p className="text-sm text-gray-400">
                  Watched on {new Date(entry.watched_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
