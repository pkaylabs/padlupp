import { useMutation } from "@tanstack/react-query";
import {
  ForgotPasswordOtpRequestPayload,
  ForgotPasswordResetPayload,
  ForgotPasswordVerifyOtpPayload,
  requestForgotPasswordOtp,
  resetForgotPassword,
  verifyForgotPasswordOtp,
} from "../api";
import { toast } from "sonner";

export function useRequestForgotPasswordOtp() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordOtpRequestPayload) =>
      requestForgotPasswordOtp(payload),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to request OTP.");
    },
  });
}

export function useVerifyForgotPasswordOtp() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordVerifyOtpPayload) =>
      verifyForgotPasswordOtp(payload),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "OTP verification failed.");
    },
  });
}

export function useResetForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordResetPayload) =>
      resetForgotPassword(payload),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Password reset failed.");
    },
  });
}
