"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative w-full h-[90vh] overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/hero_background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Foreground content */}
      <motion.div
        className="relative z-20 max-w-4xl text-left pt-24 px-8 md:px-16"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl font-extrabold text-white">Movies</h1>
        <p className="text-lg text-gray-300 mt-4 font-medium">
          From heart-pounding thrillers to tear-jerking dramas, movies take us
          on unforgettable journeys — dive into a world where every frame tells
          a story.
        </p>
      </motion.div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 z-20 bg-gradient-to-b from-transparent to-[#1e1e1e]" />
    </div>
  );
}
