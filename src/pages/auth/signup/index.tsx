// src/components/SignUpForm.tsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Divider } from "@/components/system/divider";
import TextInput from "@/components/core/inputs";
import Button from "@/components/core/buttons";
import { Link } from "@tanstack/react-router";
import ButtonLoader from "@/components/loaders/button";
import { useRegister } from "../hooks/useRegister";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { GoogleLogin } from "@react-oauth/google";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

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
    .matches(/[A-Z]/, "Must include at least one uppercase letter")
    .matches(/[0-9]/, "Must include at least one number")
    .matches(/[^A-Za-z0-9]/, "Must include at least one symbol")
    .required("Required field"),
});

export const SignUp: React.FC = () => {
  const { mutate: register, isPending: isEmailLoading } = useRegister();
  const {
    handleGoogleSuccess,
    handleGoogleError,
    isPending: isGoogleLoading,
  } = useGoogleAuth();

  const isGlobalLoading = isEmailLoading || isGoogleLoading;
  const [passwordFocused, setPasswordFocused] = React.useState(false);

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

  const passwordValue = formik.values.password || "";
  const meetsMinPasswordLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSymbol = /[^A-Za-z0-9]/.test(passwordValue);
  const meetsPasswordRequirements =
    meetsMinPasswordLength && hasUppercase && hasNumber && hasSymbol;

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-xl text-center sm:text-left sm:text-3xl font-semibold text-gray-900 dark:text-slate-100">
        Welcome to Padlupp{" "}
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
      <p className="text-gray-600 dark:text-slate-400 text-center sm:text-left mt-2 mb-8">
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
          onFocus={() => setPasswordFocused(true)}
        />
        {(passwordFocused || passwordValue.length > 0) && (
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-slate-300 mb-2">
              Password requirement
            </p>
            <div
              className={`flex items-center gap-2 text-xs ${meetsMinPasswordLength ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-slate-400"}`}
            >
              {meetsMinPasswordLength ? <Check size={14} /> : <X size={14} />}
              At least 8 characters
            </div>
            <div
              className={`flex items-center gap-2 text-xs mt-1 ${hasUppercase ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-slate-400"}`}
            >
              {hasUppercase ? <Check size={14} /> : <X size={14} />}
              At least one uppercase letter
            </div>
            <div
              className={`flex items-center gap-2 text-xs mt-1 ${hasNumber ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-slate-400"}`}
            >
              {hasNumber ? <Check size={14} /> : <X size={14} />}
              At least one number
            </div>
            <div
              className={`flex items-center gap-2 text-xs mt-1 ${hasSymbol ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-slate-400"}`}
            >
              {hasSymbol ? <Check size={14} /> : <X size={14} />}
              At least one symbol
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isGlobalLoading || !meetsPasswordRequirements}
        >
          {isEmailLoading ? <ButtonLoader title="Signing up..." /> : "Sign up "}
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
            Sign up with Google
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

      <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-8">
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
