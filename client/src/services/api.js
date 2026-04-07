import axios from "axios";

// In production VITE_API_URL is set to the deployed backend URL (e.g. Railway).
// In local dev it falls back to "/api" which is proxied to localhost:5000 by Vite.
const viteApiUrl = import.meta.env.VITE_API_URL;
const baseURL =
  viteApiUrl && viteApiUrl !== "REPLACE_WITH_YOUR_BACKEND_URL" && viteApiUrl.trim()
    ? `${viteApiUrl}/api`
    : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let authFailureHandled = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      if (!authFailureHandled) {
        authFailureHandled = true;
        window.dispatchEvent(new CustomEvent("sm:unauthorized"));
        window.setTimeout(() => {
          authFailureHandled = false;
        }, 0);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
