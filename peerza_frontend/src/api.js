import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";

const api = axios.create({
  baseURL: BASE_URL,
});

// ---- Attach token on every request ----
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Auto refresh expired tokens ----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Token expired
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = localStorage.getItem(REFRESH_TOKEN);
      if (!refresh) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${BASE_URL}token/refresh/`, { refresh });
        localStorage.setItem(ACCESS_TOKEN, res.data.access);

        // Re-attach new access token
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch (refreshError) {
        // Refresh token invalid → force logout
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
