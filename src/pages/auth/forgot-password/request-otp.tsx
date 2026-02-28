import Button from "@/components/core/buttons";
import TextInput from "@/components/core/inputs";
import ButtonLoader from "@/components/loaders/button";
import { useRequestForgotPasswordOtp } from "@/pages/auth/hooks/useForgotPassword";
import { Link, useNavigate } from "@tanstack/react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { forgotPasswordStorage } from "./storage";
import { toast } from "sonner";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required field"),
});

export const ForgotPasswordRequestOtp = () => {
  const navigate = useNavigate();
  const { mutate: requestOtp, isPending } = useRequestForgotPasswordOtp();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: (values) => {
      requestOtp(
        { email: values.email.trim() },
        {
          onSuccess: (data) => {
            forgotPasswordStorage.setEmail(values.email.trim());
            toast.success(data.detail || "OTP sent to your email.");
            void navigate({ to: "/forgot-password/verify-otp" });
          },
        },
      );
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-xl text-center sm:text-left sm:text-3xl font-semibold text-gray-900 dark:text-slate-100">
        Forgot Password
      </h1>
      <p className="text-gray-600 dark:text-slate-400 text-center sm:text-left mt-2 mb-8">
        Enter the email associated with your account.
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <TextInput
          id="email"
          label="Email"
          type="email"
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? <ButtonLoader title="Sending OTP..." /> : "Send OTP"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-8">
        Remembered your password?{" "}
        <Link to="/signin" className="font-medium text-[#4E92F4] hover:text-[#3278DE]">
          Sign in
        </Link>
      </p>
    </div>
  );
};
