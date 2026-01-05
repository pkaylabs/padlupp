// src/components/SignUpForm.tsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Divider } from "@/components/system/divider";
import TextInput from "@/components/core/inputs";
import Button from "@/components/core/buttons";
import { Link, useNavigate } from "@tanstack/react-router";
import ButtonLoader from "@/components/loaders/button";
import { useRegister } from "../hooks/useRegister";

// Google G logo SVG
export const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.6 20.1H42V20H24v8h11.3c-1.6 5.2-6.4 9-11.3 9-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.8 3.1l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.6-4z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.8 3.1l6.4-6.4C34.6 4.1 29.6 2 24 2 16.1 2 9.2 6.8 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 46c5.9 0 10.9-1.8 14.4-4.8l-6.4-6.4c-2 1.9-4.7 3.1-7.9 3.1-4.9 0-9.2-3.2-10.8-7.5l-6.6 5.1C9.2 41.2 16.1 46 24 46z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.1H42V20H24v8h11.3c-1.6 5.2-6.4 9-11.3 9-4.9 0-9.2-3.2-10.8-7.5l-6.6 5.1C9.2 41.2 16.1 46 24 46c11 0 21-8 21-22 0-1.3-.2-2.7-.6-4z"
    />
  </svg>
);

// Validation schema
const validationSchema = Yup.object({
  fullName: Yup.string().required("Required field"),
  email: Yup.string().email("Invalid email address").required("Required field"),
  password: Yup.string()
    .min(8, "Must be at least 8 characters")
    .required("Required field"),
});

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const { mutate: register, isPending, error } = useRegister();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Submitted", values);
      register({
        email: values.email,
        password: values.password,
        name: values.fullName,
      });
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-xl text-center sm:text-left sm:text-3xl font-semibold text-gray-900">
        Welcome to Padlupp 👋
      </h1>
      <p className="text-gray-600 text-center sm:text-left mt-2 mb-8">
        Find your community. Achieve goals. Stay inspired.
      </p>

      <form
        onSubmit={formik.handleSubmit}
        autoComplete="off"
        className="space-y-5"
      >
        <TextInput
          id="fullName"
          label="Full Name"
          type="text"
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />
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
          {isPending ? <ButtonLoader title="Signing up..." /> : "Sign up "}
        </Button>
      </form>

      <Divider text="or" />

      <Button variant="outline">
        <GoogleIcon />
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-gray-600 mt-8">
        Already have an account?{" "}
        <Link
          to="/signin"
          className="font-medium text-[#4E92F4] hover:text-[#3278DE]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
