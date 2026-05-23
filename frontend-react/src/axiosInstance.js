import axios from "axios";

// Base URL comes from .env  →  http://localhost:8000/api/v1
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_API,
  headers: { "Content-Type": "application/json" },
});

// ── REQUEST: attach access token ────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE: auto-refresh on 401 ───────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token → clear and go to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_API}/token/refresh/`,
          { refresh: refreshToken },
        );
        const newAccess = res.data.access;
        localStorage.setItem("accessToken", newAccess);
        // If backend also rotated the refresh token
        if (res.data.refresh) {
          localStorage.setItem("refreshToken", res.data.refresh);
        }
        original.headers["Authorization"] = `Bearer ${newAccess}`;
        return axiosInstance(original);
      } catch {
        // Refresh failed → force logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
