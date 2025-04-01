import { useState } from "react";
import { Link } from "react-router-dom";
import { Film, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative flex justify-between items-center p-4 bg-black text-white shadow-lg">
      {/* Logo */}
      <h1
        className="text-4xl font-bold flex items-center gap-2"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          color: "white",  // Ensures the text is visible
          textShadow: "0 0 6px rgba(0, 0, 255, 0.58), 0 0 10px rgba(0, 0, 255, 0.5)" // Softer neon glow
        }}
      >
        <img 
          src="/src/assets/movie-svgrepo-com.svg" 
          alt="Movie Logo" 
          className="w-8 h-8" 
        />
        MoviSk
      </h1>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-6">
        <NavLink to="/" text="Dashboard" />
        <NavLink to="/profile" text="Profile" />
        <NavLink to="/login" text="Login" />
        <NavLink to="/signup" text="Signup" />
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg text-white hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu (Fixed Positioning) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 bg-black rounded-xl shadow-lg p-4 flex flex-col gap-3 w-48 md:hidden z-50"
        >
          <NavLink to="/" text="Dashboard" onClick={() => setIsOpen(false)} />
          <NavLink to="/profile" text="Profile" onClick={() => setIsOpen(false)} />
          <NavLink to="/login" text="Login" onClick={() => setIsOpen(false)} />
          <NavLink to="/signup" text="Signup" onClick={() => setIsOpen(false)} />
        </motion.div>
      )}
    </nav>
  );
};

// Reusable NavLink Component
const NavLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="hover:text-blue-400 px-3 py-1 transition-all duration-300 hover:shadow-lg"
  >
    {text}
  </Link>
);

export default Navbar;
