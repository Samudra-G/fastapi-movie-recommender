"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "../components/HeroSection";
import GenreSelector from "../components/GenreSelector";
import WatchHistory from "../components/WatchHistory";
import MovieList from "../components/MovieList";
import Footer from "../components/Footer";
import SectionHeader from "../components/SectionHeader";
import RecommendationCarousel from "../components/RecommendationCarousel";

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  return (
    <main className="relative bg-[#1e1e1e] text-white overflow-x-hidden">
      {/* Hero Section - fixed like a full-screen intro */}
      <motion.section
        className="relative z-10 h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <HeroSection />
      </motion.section>

      {/* Overlapping Scrollable Sections */}
      <section className="relative z-20 -mt-32 space-y-24 pb-20">
        {/* Watch History */}
        <motion.div
          className="min-h-[80vh] px-4 py-24 flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="max-w-screen-xl w-full">
            <WatchHistory />
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          className="min-h-[80vh] px-4 py-24 flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-screen-xl w-full">
            {showRecommendations && (
              <SectionHeader title="Based on What You Like" />
            )}
            <RecommendationCarousel onReady={setShowRecommendations} />
          </div>
        </motion.div>

        {/* Explore Movies */}
        <motion.div
          className="min-h-screen px-4 flex items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="max-w-screen-xl w-full">
            <SectionHeader title="Explore Movies" />
            <MovieList mode="all" selectedGenre={selectedGenre} />
          </div>
        </motion.div>

        {/* Genre Selector */}
        <motion.div
          className="min-h-screen px-4 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Want to watch your favourite genre?
          </h2>
          <GenreSelector
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
          />
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
