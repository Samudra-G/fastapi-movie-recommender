import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const TEST_USERNAME = import.meta.env.VITE_TEST_USERNAME;
const TEST_PASSWORD = import.meta.env.VITE_TEST_PASSWORD;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMovies = async (query = "", genre = "", page = 1, perPage = 50) => {
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
    console.error("Error fetching movies:", error.response?.data || error.message);
    return [];
  }
};

export const fetchMovieById = async (movieId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies/${movieId}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
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

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
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
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found.");

    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchSimilarMovies = async (movieId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies/${movieId}/similar`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return [];
  }
};
