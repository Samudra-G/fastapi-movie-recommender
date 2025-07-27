"use client";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full mt-12 py-6 text-center text-gray-400 border-t border-gray-700">
      <div className="flex justify-center gap-4 mb-2">
        {[FaFacebook, FaTwitter, FaInstagram].map((Icon, i) => (
          <motion.div key={i} whileHover={{ scale: 1.2 }}>
            <Icon size={24} className="cursor-pointer hover:text-white transition" />
          </motion.div>
        ))}
      </div>
      <p className="text-sm">
        Movie Seeker &copy; {new Date().getFullYear()} | All Rights Reserved
      </p>
    </footer>
  );
}
