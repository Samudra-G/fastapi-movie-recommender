import React, { useState } from "react";
import { useRouter } from "next/router";
import { loginUser } from "@/services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(identifier, password);
      localStorage.setItem("token", data.access_token);
      toast.success("Login Successful! 🎉");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Login Failed. ❌");
    }
    setLoading(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1e1e1e] min-h-screen flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md shadow-lg rounded-2xl border border-white/20 p-8"
      >
        <h1 className="text-2xl font-bold text-center text-gray-100 mb-6">
          Sign in to your account
        </h1>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter username or email"
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-400">
              <input
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded bg-gray-700 dark:border-gray-600 focus:ring-blue-500"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-sm font-medium text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className={`w-full py-3 px-4 font-semibold rounded-lg transition ${
              loading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Sign in"}
          </motion.button>
          <p className="text-sm text-gray-400 text-center">
            Don’t have an account yet?{" "}
            <a href="/signup" className="font-medium text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </motion.div>
    </motion.section>
  );
};

export default Login;
