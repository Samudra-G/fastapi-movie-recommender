import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white border-b-2 border-gray-700 shadow-md">
      <h1 className="text-xl font-bold text-blue-400 border-2 border-blue-400 px-3 py-1 rounded-lg">MovieSeeker</h1>
      <div className="flex gap-6">
        <Link to="/" className="hover:text-blue-400 border border-transparent px-3 py-1 rounded-lg transition-all duration-300 hover:border-blue-400">Dashboard</Link>
        <Link to="/profile" className="hover:text-blue-400 border border-transparent px-3 py-1 rounded-lg transition-all duration-300 hover:border-blue-400">Profile</Link>
        <Link to="/login" className="hover:text-blue-400 border border-transparent px-3 py-1 rounded-lg transition-all duration-300 hover:border-blue-400">Login</Link>
        <Link to="/signup" className="hover:text-blue-400 border border-transparent px-3 py-1 rounded-lg transition-all duration-300 hover:border-blue-400">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;
