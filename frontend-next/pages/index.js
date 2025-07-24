"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "../components/HeroSection";
import SearchBar from "../components/SearchBar";
import GenreSelector from "../components/GenreSelector";
import WatchHistory from "../components/WatchHistory";
import MovieList from "../components/MovieList";
import Footer from "../components/Footer";
import SectionHeader from "../components/SectionHeader";

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#1e1e1e] text-white">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-8"
      >
        <HeroSection />
      </motion.section>

      <section className="container max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SearchBar setSearchQuery={setSearchQuery} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GenreSelector selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <WatchHistory />
        </motion.div>

        <div className="mt-10">
          <SectionHeader title="Recommended For You" />
          <MovieList mode="recommended" searchQuery={searchQuery} selectedGenre={selectedGenre} />
        </div>

        <div className="mt-12">
          <SectionHeader title="All Movies" />
          <MovieList mode="all" searchQuery={searchQuery} selectedGenre={selectedGenre} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
