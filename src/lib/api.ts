import { BASE_URL } from "@/constants";
import { useAuthStore } from "@/features/auth/authStore";
import axios from "axios";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();

      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
