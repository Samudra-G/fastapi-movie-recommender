import React, { useEffect, useState } from "react";
import { fetchUserProfile, logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUser(data);
      } catch (err) {
        setError("Failed to fetch profile. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (loading) return <p className="text-center text-gray-500">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="p-6 w-[350px] bg-gray-800 text-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">Profile</h2>
        {user ? (
          <div>
            <p><strong>Username:</strong> {user.name || "N/A"}</p>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Role:</strong> <span className={user.role === "admin" ? "text-yellow-400 font-bold" : "text-green-400"}>{user.role || "N/A"}</span></p>
            <p><strong>Joined:</strong> {new Date(user.created_at).toDateString()}</p>
            <button
              onClick={handleLogout}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-gray-500">No user data found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
