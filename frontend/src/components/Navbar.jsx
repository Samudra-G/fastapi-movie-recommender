import { Link } from "react-router-dom";
import { Film } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md">
      {/* Logo */}
      <h1 className="text-4xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text neon-glow" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        <Film size={28} className="text-blue-400" />
        MoviSk
      </h1>

      {/* Navigation Links */}
      <div className="flex gap-6">
        <Link to="/" className="hover:text-blue-400 px-3 py-1 transition-all duration-300 hover:shadow-lg">Dashboard</Link>
        <Link to="/profile" className="hover:text-blue-400 px-3 py-1 transition-all duration-300 hover:shadow-lg">Profile</Link>
        <Link to="/login" className="hover:text-blue-400 px-3 py-1 transition-all duration-300 hover:shadow-lg">Login</Link>
        <Link to="/signup" className="hover:text-blue-400 px-3 py-1 transition-all duration-300 hover:shadow-lg">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;
