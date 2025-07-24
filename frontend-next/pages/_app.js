import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { fetchUserProfile } from "@/services/api"; // adjust if not alias-imported

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserProfile(); // returns null if no token or unauthorized
        setUser(data);
      } catch (err) {
        setUser(null); // treat as guest
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar user={user} loadingUser={loadingUser} />
      <Component {...pageProps} user={user} loadingUser={loadingUser} />
    </>
  );
}
