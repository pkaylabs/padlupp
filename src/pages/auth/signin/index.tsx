// src/components/SignUpForm.tsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Divider } from "@/components/system/divider";
import TextInput from "@/components/core/inputs";
import Button from "@/components/core/buttons";
import { Link } from "@tanstack/react-router";
import { GoogleIcon } from "../signup";
import ButtonLoader from "@/components/loaders/button";
import { useLogin } from "../hooks/useLogin";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required field"),
  password: Yup.string()
    .min(8, "Must be at least 8 characters")
    .required("Required field"),
});

export const SignIn: React.FC = () => {
  const { mutate: login, isPending: isEmailLoading } = useLogin();
  const {
    handleGoogleSuccess,
    handleGoogleError,
    isPending: isGoogleLoading,
  } = useGoogleAuth();

  const isGlobalLoading = isEmailLoading || isGoogleLoading;

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Submitted", values);
      login(values);
    },
  });

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-xl text-center sm:text-left sm:text-3xl font-semibold text-gray-900">
        Welcome Back{" "}
        <motion.span
          className="inline-block origin-[70%_70%]"
          animate={{ rotate: [0, 16, -10, 16, -6, 10, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatDelay: 1.1,
            ease: "easeInOut",
          }}
        >
          👋
        </motion.span>
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
          {isEmailLoading ? <ButtonLoader title="Signing in..." /> : "Sign in"}
        </Button>
      </form>

      <Divider text="or" />

      {/* <Button
        variant="outline"
        onClick={() => loginWithGoogle()}
        disabled={isGlobalLoading}
        type="button"
      >
        {isGoogleLoading ? (
          <ButtonLoader title="Connecting..." />
        ) : (
          <>
            <GoogleIcon />
            Sign in with Google
          </>
        )}
      </Button> */}

      <div className="flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          width="100%"
          text="signin_with"
          shape="circle"
        />
      </div>

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
