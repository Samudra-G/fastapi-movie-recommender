import React, { useEffect, useState } from "react";
import { fetchUserProfile, logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUser(data);
      } catch (err) {
        toast.error("❌ Failed to fetch profile. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, []);

  const handleLogout = () => {
    logoutUser();
    toast.success("👋 Logged out successfully!");
    navigate("/login");
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading profile...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative p-6 w-[400px] bg-white/10 backdrop-blur-md shadow-lg rounded-2xl border border-white/20"
      >
        <motion.img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "User"}`}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
        <h2 className="text-2xl font-bold text-blue-400 text-center mt-4">
          {user?.name || "Guest"}
        </h2>
        <p className="text-gray-300 text-center">{user?.email || "N/A"}</p>
        <p className="text-center mt-2">
          <strong className="text-gray-400">Role:</strong>{" "}
          <span
            className={`font-semibold ${
              user?.role === "admin" ? "text-yellow-400" : "text-green-400"
            }`}
          >
            {user?.role || "User"}
          </span>
        </p>
        <p className="text-center text-gray-400 mt-2">
          Joined: {new Date(user?.created_at).toDateString()}
        </p>
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Logout
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Profile;
