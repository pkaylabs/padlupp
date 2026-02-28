import Button from "@/components/core/buttons";
import TextInput from "@/components/core/inputs";
import ButtonLoader from "@/components/loaders/button";
import { useVerifyForgotPasswordOtp } from "@/pages/auth/hooks/useForgotPassword";
import { Link, useNavigate } from "@tanstack/react-router";
import { useFormik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";
import { forgotPasswordStorage } from "./storage";
import { toast } from "sonner";

const validationSchema = Yup.object({
  otp: Yup.string().required("Required field"),
});

export const ForgotPasswordVerifyOtp = () => {
  const navigate = useNavigate();
  const { mutate: verifyOtp, isPending } = useVerifyForgotPasswordOtp();
  const email = forgotPasswordStorage.getEmail();

  useEffect(() => {
    if (!email) {
      void navigate({ to: "/forgot-password", replace: true });
    }
  }, [email, navigate]);

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema,
    onSubmit: (values) => {
      if (!email) {
        return;
      }

      verifyOtp(
        { email, otp: values.otp.trim() },
        {
          onSuccess: (data) => {
            forgotPasswordStorage.setResetToken(data.reset_token);
            toast.success(data.detail || "OTP verified.");
            void navigate({ to: "/forgot-password/reset-password" });
          },
        },
      );
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-xl text-center sm:text-left sm:text-3xl font-semibold text-gray-900 dark:text-slate-100">
        Verify OTP
      </h1>
      <p className="text-gray-600 dark:text-slate-400 text-center sm:text-left mt-2 mb-8">
        Enter the OTP sent to {email || "your email"}.
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <TextInput
          id="otp"
          label="OTP"
          type="text"
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        <Button type="submit" variant="primary" disabled={isPending || !email}>
          {isPending ? <ButtonLoader title="Verifying..." /> : "Verify OTP"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-8">
        Wrong email?{" "}
        <Link to="/forgot-password" className="font-medium text-[#4E92F4] hover:text-[#3278DE]">
          Start again
        </Link>
      </p>
    </div>
  );
};
