import React, { useState } from "react";
import { useRouter } from "next/router";
import { registerUser } from "../services/api";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(username, email, password);
      toast.success("Signup Successful! Redirecting to login...", {
        duration: 2000,
      });
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      toast.error("Signup Failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4 pt-24 pb-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Create an account
        </h1>
        <form className="space-y-4" onSubmit={handleSignup}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block mb-2 text-sm font-medium text-white">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="w-full p-3 bg-blue-400/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block mb-2 text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              className="w-full p-3 bg-blue-400/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block mb-2 text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-3 bg-blue-400/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
            />
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full p-3 font-semibold rounded-lg transition ${
              loading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing up..." : "Sign up"}
          </motion.button>
          <p className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-400 hover:underline"
            >
              Sign in
            </a>
          </p>
        </form>
      </motion.div>
    </section>
  );
};

export default Signup;
