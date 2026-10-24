import { BASE_URL } from "@/constants";
import { useAuthStore } from "@/features/auth/authStore";
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { isCurrentAuthRequest } from "@/utils/auth-session";

interface SessionRequestConfig extends InternalAxiosRequestConfig {
  authSessionId?: string | null;
}

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers);
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const { token, sessionId } = useAuthStore.getState();
  (config as SessionRequestConfig).authSessionId = sessionId;

  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const request = error.config as SessionRequestConfig | undefined;
    if (
      error.response?.status === 401 &&
      isCurrentAuthRequest(
        AxiosHeaders.from(request?.headers).get("Authorization"),
        request?.authSessionId,
        useAuthStore.getState(),
      )
    ) {
      useAuthStore.getState().logout();

      window.location.href = "/signin";
    }
    return Promise.reject(error);
  },
);
