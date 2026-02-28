import { api } from "@/lib/api";

// Types (Move to a shared types file if reused often)
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string; // Add other fields if needed
}

export interface GoogleAuthPayload {
  id_token: string;
  name?: string;
  phone?: string;
}

export interface ForgotPasswordOtpRequestPayload {
  email: string;
}

export interface ForgotPasswordVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordResetPayload {
  reset_token: string;
  new_password: string;
  confirm_password: string;
}

// export interface AuthResponse {
//   token: string;
//   user: {
//     id: string;
//     email: string;
//     name?: string;
//     role?: 'admin' | 'user';
//   };
// }

// Pure Async Function
export const loginUser = async (
  credentials: LoginCredentials,
): Promise<any> => {
  const { data } = await api.post<any>("/auth/login/", credentials);
  return data;
};

export const registerUser = async (
  credentials: RegisterCredentials,
): Promise<any> => {
  const { data } = await api.post<any>("/onboarding/register/", credentials);
  return data;
};

export const googleAuthUser = async (payload: GoogleAuthPayload) => {
  const response = await api.post("/auth/google-auth/", payload);
  return {
    data: response.data,
    status: response.status,
  };
};

export const requestForgotPasswordOtp = async (
  payload: ForgotPasswordOtpRequestPayload,
) => {
  const { data } = await api.post("/auth/forgot-password/request-otp/", payload);
  return data as { detail: string };
};

export const verifyForgotPasswordOtp = async (
  payload: ForgotPasswordVerifyOtpPayload,
) => {
  const { data } = await api.post("/auth/forgot-password/verify-otp/", payload);
  return data as { detail: string; reset_token: string };
};

export const resetForgotPassword = async (
  payload: ForgotPasswordResetPayload,
) => {
  const { data } = await api.post(
    "/auth/forgot-password/reset-password/",
    payload,
  );
  return data as { detail: string };
};
