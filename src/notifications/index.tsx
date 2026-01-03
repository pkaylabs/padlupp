import { FC, PropsWithChildren } from "react";
import Toaster from "./toaster";
import toast from "react-hot-toast";

const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
};

export default NotificationProvider;

// Toast helpers
type ToastPayload = {
  type: "success" | "error" | "loading" | "notification" | "warning";
  title: string;
  description?: string;
};

function toJson(payload: ToastPayload) {
  return JSON.stringify(payload);
}

export const notifySuccess = (title: string, description?: string) =>
  toast(toJson({ type: "success", title, description }));

export const notifyError = (title: string, description?: string) =>
  toast(toJson({ type: "error", title, description }));

export const notifyLoading = (title: string, description?: string) =>
  toast.loading(toJson({ type: "loading", title, description }));

export const notifyInfo = (title: string, description?: string) =>
  toast(toJson({ type: "notification", title, description }));
