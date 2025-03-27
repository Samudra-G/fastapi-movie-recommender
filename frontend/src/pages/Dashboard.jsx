import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-3xl bg-white/10 backdrop-blur-md shadow-lg rounded-2xl border border-white/20 p-8 text-center"
      >
        <h1 className="text-3xl font-extrabold text-blue-400 drop-shadow-lg mb-6">
          Dashboard
        </h1>

        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[
            { text: "Home", color: "bg-blue-600", path: "/" },
            { text: "Profile", color: "bg-green-600", path: "/profile" },
            { text: "Movie Details", color: "bg-purple-600", path: "/movie/33633" },
            { text: "Logout", color: "bg-red-600", path: "/login" },
          ].map((btn, index) => (
            <motion.button
              key={index}
              onClick={() => navigate(btn.path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${btn.color} text-white font-bold p-4 rounded-lg shadow-md transition-all hover:shadow-xl hover:${btn.color.replace(
                "600",
                "700"
              )}`}
            >
              {btn.text}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Dashboard;
