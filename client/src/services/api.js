import axios from "axios";

// In production VITE_API_URL is set to the deployed backend URL (e.g. Railway).
// In local dev it falls back to "/api" which is proxied to localhost:5000 by Vite.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("sm_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
