import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const TEST_USERNAME = process.env.NEXT_PUBLIC_TEST_USERNAME;
const TEST_PASSWORD = process.env.NEXT_PUBLIC_TEST_PASSWORD;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMovies = async (
  query = "",
  genre = "",
  page = 1,
  perPage = 50
) => {
  query = query || "";
  genre = genre || "";
  try {
    let url = `${API_BASE_URL}/movies/`;
    const params = new URLSearchParams();

    if (query.trim() !== "") {
      url += `search`;
      params.append("query", query.trim());
    } else {
      if (genre.trim() !== "") params.append("genre", genre.trim());
      params.append("page", page);
      params.append("per_page", perPage);
    }

    url += `?${params.toString()}`;
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching movies:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const fetchMovieById = async (movieId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies/${movieId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
};

export const fetchSimilarMovies = async (movieId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/movies/${movieId}/similar`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return [];
  }
};

export const loginUser = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const token = response.data.access_token;
    if (!token) throw new Error("No token received from login response");

    localStorage.setItem("token", token);
    console.log("✅ Token stored successfully");

    // Post-login tasks (non-critical)
    fetchUserProfile()
      .then((user) => {
        console.log("✅ Profile fetched:", user);
        if (user?.user_id) {
          generateRecommendations(user.user_id)
            .then(() => console.log("✅ Recommendations generated"))
            .catch((err) =>
              console.warn("⚠️ Failed to generate recommendations:", err)
            );
        }
      })
      .catch((err) =>
        console.warn("⚠️ Failed to fetch user profile after login:", err)
      );

    return response.data;
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    throw error;
  }
};


export const fetchRecommendations = async (topN = 12) => {
  try {
    const user = await fetchUserProfile();
    const userId = user.user_id || user.id;

    const res = await axios.get(
      `${API_BASE_URL}/users/${userId}/recommendations?top_n=${topN}`,
      {
        headers: authHeader(),
      }
    );

    return res.data;
  } catch (error) {
    console.warn("User not logged in or recommendation fetch failed:", error.message);
    return { recommendations: [] };
  }
};


export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Signup failed:", error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

export const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("🟡 Guest user (no token).");
    return null; // or return a default guest profile
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("🟥 Unauthorized token. Treating as guest.");
      return null;
    }

    console.error(
      "❌ Error fetching user profile:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const addToWatchHistory = async (movieId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/me/watch/${movieId}`,
      {},
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding to watch history:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchWatchHistory = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/users/me/history`, {
      headers: authHeader(),
    });
    return res.data;
  } catch (err) {
    console.error(
      "Failed to fetch watch history:",
      err.response?.data || err.message
    );
    return [];
  }
};

export const generateRecommendations = async (userId) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/users/${userId}/recommendations`,
      {},
      { headers: authHeader() }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Failed to generate recommendations:",
      error.response?.data || error.message
    );
    throw error;
  }
};
