// src/components/SignUpForm.tsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Divider } from "@/components/system/divider";
import TextInput from "@/components/core/inputs";
import Button from "@/components/core/buttons";
import { Link, useNavigate } from "@tanstack/react-router";
import { GoogleIcon } from "../signup";
import ButtonLoader from "@/components/loaders/button";
import { useLogin } from "../hooks/useLogin";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required field"),
  password: Yup.string()
    .min(8, "Must be at least 8 characters")
    .required("Required field"),
});

export const SignIn: React.FC = () => {
  // const navigate = useNavigate();

  const { mutate: login, isPending, error } = useLogin();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Submitted", values);
      login(values);

      // navigate({ to: "/onboarding" });
      // alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-xl text-center sm:text-left sm:text-3xl font-semibold text-gray-900">
        Welcome Back 👋
      </h1>
      <p className="text-gray-600 text-center sm:text-left mt-2 mb-8">
        Find your community. Achieve goals. Stay inspired.
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

        <Button type="submit" variant="primary">
          {isPending ? <ButtonLoader title="Signing in..." /> : "Sign in"}
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
