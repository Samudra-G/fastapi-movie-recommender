import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full h-full flex flex-col items-center justify-center">
       <div className="w-full max-w-4xl bg-white rounded-lg shadow-md dark:border dark:bg-gray-800 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate("/")} className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Home</button>
          <button onClick={() => navigate("/profile")} className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700">Profile</button>
          <button onClick={() => navigate("/movie/1")} className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Movie Details</button>
          <button onClick={() => navigate("/login")} className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button>
        </div>
       </div> 
      </div>
    </section>
  );
};

export default Dashboard;