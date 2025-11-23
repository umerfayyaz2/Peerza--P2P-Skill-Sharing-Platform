import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";

const api = axios.create({
  baseURL: BASE_URL,
});

// ---- Attach token to every request ----
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Handle token expiration & refresh automatically ----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem(REFRESH_TOKEN);
      if (!refresh) {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Try refreshing token
        const { data } = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh,
        });

        localStorage.setItem(ACCESS_TOKEN, data.access);
        api.defaults.headers.Authorization = `Bearer ${data.access}`;
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout user
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
