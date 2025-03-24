import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUser(data);
      } catch (err) {
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, []);

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
            <p><strong>Joined:</strong> {new Date(user.created_at).toDateString()}</p>
          </div>
        ) : (
          <p className="text-gray-500">No user data found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
