"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.div
      className="w-full max-w-4xl text-left mt-6"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-6xl font-extrabold text-white">Movies</h1>
      <p className="text-lg text-gray-300 mt-2 font-medium">
        Movies move us like nothing else can...
      </p>
    </motion.div>
  );
}
