// src/components/SignUpForm.tsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Divider } from "@/components/system/divider";
import TextInput from "@/components/core/inputs";
import Button from "@/components/core/buttons";
import { Link, useNavigate } from "@tanstack/react-router";
import { GoogleIcon } from "../signup";
import { login, ApiError } from "@/utils/api";
import { tryCatch } from "@/utils/try-catch";

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

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      const [data, err] = await tryCatch(login(values));
      setLoading(false);
      if (err) {
        setError((err as ApiError).detail || "Login failed");
        return;
      }
      // Optionally store token/user info here
      navigate({ to: "/onboarding" });
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
          label="Create password"
          type="password"
          placeholder="Password"
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
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
