import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

// 1. The Base URL
// This tells React: "Whenever I ask for data, go to this Django server."
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "http://127.0.0.1:8000/api/",
})

// 2. The Interceptor (The Security Guard)
// Before sending any request, check if we have a "Access Token" (Digital ID card).
// If yes, staple it to the request so Django knows who we are.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api