import Button from "@/components/core/buttons";
import TextInput from "@/components/core/inputs";
import ButtonLoader from "@/components/loaders/button";
import { useResetForgotPassword } from "@/pages/auth/hooks/useForgotPassword";
import { Link, useNavigate } from "@tanstack/react-router";
import { useFormik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";
import { forgotPasswordStorage } from "./storage";
import { toast } from "sonner";

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, "Must be at least 8 characters")
    .required("Required field"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Required field"),
});

export const ForgotPasswordResetPassword = () => {
  const navigate = useNavigate();
  const { mutate: resetPassword, isPending } = useResetForgotPassword();

  const resetToken = forgotPasswordStorage.getResetToken();

  useEffect(() => {
    if (!resetToken) {
      void navigate({ to: "/forgot-password", replace: true });
    }
  }, [navigate, resetToken]);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (!resetToken) {
        return;
      }

      resetPassword(
        {
          reset_token: resetToken,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword,
        },
        {
          onSuccess: (data) => {
            forgotPasswordStorage.clear();
            toast.success(data.detail || "Password reset successful.");
            void navigate({ to: "/signin", replace: true });
          },
        },
      );
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-xl text-center sm:text-left sm:text-3xl font-semibold text-gray-900 dark:text-slate-100">
        Reset Password
      </h1>
      <p className="text-gray-600 dark:text-slate-400 text-center sm:text-left mt-2 mb-8">
        Set your new password, then sign in again.
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <TextInput
          id="newPassword"
          label="New password"
          type="password"
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        <TextInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        <Button type="submit" variant="primary" disabled={isPending || !resetToken}>
          {isPending ? (
            <ButtonLoader title="Resetting password..." />
          ) : (
            "Reset password"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-8">
        Back to{" "}
        <Link to="/signin" className="font-medium text-[#4E92F4] hover:text-[#3278DE]">
          Sign in
        </Link>
      </p>
    </div>
  );
};
