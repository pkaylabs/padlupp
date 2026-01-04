// src/components/SignUpForm.tsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Divider } from "@/components/system/divider";
import TextInput from "@/components/core/inputs";
import Button from "@/components/core/buttons";
import { Link, useNavigate } from "@tanstack/react-router";
import { GoogleIcon } from "../signup";
import { login, ApiError, LoginResponse } from "@/utils/api";
import { tryCatch } from "@/utils/try-catch";
import { useAuth } from "@/components/core/auth-context";
import { notifyLoading, notifyError, notifySuccess } from "@/notifications";
import toast from "react-hot-toast";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DASHBOARD } from "@/constants/page-path";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required field"),
  password: Yup.string()
    .min(8, "Must be at least 8 characters")
    .required("Required field"),
});

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { setUser, setToken } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      const toastId = notifyLoading("Signing in...");
      const [data, err] = await tryCatch(login(values));
      setLoading(false);
      if (err) {
        const detail = (err as ApiError).detail || "Login failed";
        setError(detail);
        toast.dismiss(toastId);
        notifyError("Login failed", detail);
        return;
      }
      // Store token and user in context
      const { user, token } = data as LoginResponse;
      setUser(user);
      setToken(token);
      // Ensure route guard sees token immediately
      try {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
      } catch {}
      toast.dismiss(toastId);
      notifySuccess("Welcome back!", `Signed in as ${user.name || user.email}`);
      navigate({ to: DASHBOARD });
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold text-gray-900">Welcome Back 👋</h1>
      <p className="text-gray-600 mt-2 mb-8">
        Find your community. Achieve goals. Stay inspired.
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}
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
        <TextInput
          id="password"
          label="Enter password"
          type="password"
          placeholder="Password"
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              Signing in...
              <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <Divider text="or" />

      <Button variant="outline">
        <GoogleIcon />
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-gray-600 mt-8">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-[#4E92F4] hover:text-[#3278DE]"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};
