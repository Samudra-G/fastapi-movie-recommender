"use client";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "../services/api";
import MovieCard from "./MovieCard";
import axios from "axios";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

// Accepts an optional callback prop
const RecommendationCarousel = ({ onReady }) => {
  const [movies, setMovies] = useState([]);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUnauthorized(true);
          onReady?.(false);
          return;
        }

        let profile;
        try {
          profile = await fetchUserProfile();
        } catch (err) {
          console.warn("Token expired or invalid:", err);
          setUnauthorized(true);
          onReady?.(false);
          return;
        }

        if (!profile) {
          setUnauthorized(true);
          onReady?.(false);
          return;
        }

        const userId = profile.user_id || profile.id;
        if (!userId) {
          setUnauthorized(true);
          onReady?.(false);
          return;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/recommendations?top_n=12`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const recommendations = res.data.recommendations || [];
        setMovies(recommendations);
        onReady?.(recommendations.length > 0);
      } catch (err) {
        console.error("Failed to load recommendations", err);
        setMovies([]);
        onReady?.(false);
      }
    };

    loadRecommendations();
  }, [onReady]);

  if (unauthorized) {
    return (
      <div className="text-white text-center py-16">
        <p className="text-3xl sm:text-4xl font-semibold mb-6 leading-snug">
          Get curated movies tailored right to your taste!
        </p>
        <p className="text-md text-gray-400 mb-8">
          Login to continue expanding your feed.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-lg transition-colors duration-200"
        >
          Login
        </Link>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <p className="text-white text-center py-10">
        No recommendations available.
      </p>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto py-10 overflow-visible">
      <Swiper
        modules={[Autoplay]}
        loop
        centeredSlides
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          0: {
            slidesPerView: 1.4, // only 1 full + part of 2nd
            spaceBetween: 12,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 28,
          },
        }}
        className="w-full px-2 sm:px-4"
      >
        {movies.map((movie, index) => (
          <SwiperSlide
            key={movie.movie_id || index}
            className="overflow-visible"
          >
            {({ isActive }) => (
              <div
                className={`transition-transform duration-500 flex justify-center ${
                  isActive ? "scale-105 z-10" : "scale-95 opacity-80"
                }`}
              >
                <MovieCard movie={movie} />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RecommendationCarousel;
