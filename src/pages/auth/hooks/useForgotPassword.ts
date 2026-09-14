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
import { getApiErrorMessage } from "@/utils/api-error";

export function useRequestForgotPasswordOtp() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordOtpRequestPayload) =>
      requestForgotPasswordOtp(payload),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to request OTP."));
    },
  });
}

export function useVerifyForgotPasswordOtp() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordVerifyOtpPayload) =>
      verifyForgotPasswordOtp(payload),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "OTP verification failed."));
    },
  });
}

export function useResetForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordResetPayload) =>
      resetForgotPassword(payload),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Password reset failed."));
    },
  });
}
