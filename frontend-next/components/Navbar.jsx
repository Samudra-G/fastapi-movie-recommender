"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-[#1e1e1e]/60 border-b border-white/10 px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-3xl font-bold tracking-wide">
        <Film className="w-7 h-7 text-blue-400 drop-shadow" />
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: "white",
            textShadow:
              "0 0 6px rgba(0, 0, 255, 0.5), 0 0 10px rgba(0, 0, 255, 0.3)",
          }}
        >
          MoviSk
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex gap-6 text-white text-lg font-medium">
        <NavLink to="/dashboard" text="Dashboard" />
        <NavLink to="/" text="Home" />
        <NavLink to="/profile" text="Profile" />
        <NavLink to="/login" text="Login" />
        <NavLink to="/signup" text="Signup" />
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-4 mt-2 bg-[#1e1e1e] text-white rounded-xl shadow-xl p-4 flex flex-col gap-4 w-44 md:hidden"
          >
            <NavLink to="/dashboard" text="Dashboard" onClick={() => setIsOpen(false)} />
            <NavLink to="/" text="Home" onClick={() => setIsOpen(false)} />
            <NavLink to="/profile" text="Profile" onClick={() => setIsOpen(false)} />
            <NavLink to="/login" text="Login" onClick={() => setIsOpen(false)} />
            <NavLink to="/signup" text="Signup" onClick={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, text, onClick }) => (
  <Link
    href={to}
    onClick={onClick}
    className="hover:text-blue-400 transition-colors duration-300"
  >
    {text}
  </Link>
);

export default Navbar;
