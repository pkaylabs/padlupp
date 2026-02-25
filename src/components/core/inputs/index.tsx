// src/components/TextInput.tsx
import _ from "lodash";
import type {
  ChangeEventHandler,
  CSSProperties,
  FC,
  FocusEventHandler,
  InputHTMLAttributes,
} from "react";
// --- NEW: Import useRef and useEffect ---
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cs";

// Label variants (unchanged)
const labelVariants = {
  floating: {
    top: "-0.75rem",
    left: "0.75rem",
    fontSize: "0.75rem",
    paddingLeft: "0.25rem",
    paddingRight: "0.25rem",
    backgroundColor: "var(--input-label-bg, #ffffff)",
  },
  resting: {
    top: "0.75rem",
    left: "1rem",
    fontSize: "1rem",
    paddingLeft: "0rem",
    paddingRight: "0rem",
    backgroundColor: "#ffffff00",
  },
};

// Error variants (unchanged)
const errorVariants = {
  hidden: { opacity: 0, height: 0, y: -10, marginTop: "0rem" },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    marginTop: "0.5rem",
  },
};

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  values: unknown;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  handleBlur: FocusEventHandler<HTMLInputElement>;
  errors?: unknown;
  touched?: unknown;
}

export const TextInput: FC<TextInputProps> = ({
  id,
  type,
  label,
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
  className,
  placeholder,
  onFocus,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);

  // --- NEW: Create a ref for the input element ---
  const inputRef = useRef<HTMLInputElement>(null);

  const value = _.get(values, id);
  const hasError = !!(_.get(errors, id) && _.get(touched, id));

  // --- UPDATED: Floating logic (this is the same) ---
  const isFloating = isFocused || !!value || isAutofilled;

  // --- NEW: Check for autofill on component mount ---
  useEffect(() => {
    const input = inputRef.current;
    if (input && input.matches(":-webkit-autofill")) {
      setIsAutofilled(true);
    }
  }, []); // Empty dependency array runs this only once on mount

  // --- Wrapper for onFocus (unchanged) ---
  const handleInputFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  // --- Wrapper for onBlur (updated to clear autofill state) ---
  const handleInputBlurWrapper: FocusEventHandler<HTMLInputElement> = (e) => {
    setIsFocused(false);
    // This is still important: reset autofill state if the field is empty
    setIsAutofilled(e.target.matches(":-webkit-autofill"));
    handleBlur(e);
  };

  // --- Wrapper for onChange (updated to clear autofill state) ---
  const handleInputChangeWrapper: ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    // Also check on change
    setIsAutofilled(e.target.matches(":-webkit-autofill"));
    handleChange(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const currentInputType =
    type === "password" ? (isPasswordVisible ? "text" : "password") : type;

  const labelColor = hasError ? "#EF4444" : isFocused ? "#3B82F6" : "#6B7280";
  const labelBg = isFloating
    ? document.documentElement.classList.contains("dark")
      ? "#0f172a"
      : "#ffffff"
    : "#00000000";

  return (
    <div className={cn("relative w-full", className)}>
      {/* 1. The Outlined Container */}
      <div
        className={cn(
          "relative w-full rounded-lg border transition-colors",
          hasError
            ? "border-red-500"
            : isFocused
              ? "border-blue-500"
              : "border-gray-300",
          "flex items-center"
        )}
      >
        {/* 2. The Floating Label */}
        {label && (
          <motion.label
            htmlFor={id}
            className="absolute z-10"
            variants={labelVariants}
            initial={isFloating ? "floating" : "resting"}
            animate={isFloating ? "floating" : "resting"}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={
              {
                color: labelColor,
                "--input-label-bg": labelBg,
              } as CSSProperties
            }
          >
            {label}
          </motion.label>
        )}

        {/* 3. Input Wrapper */}
        <div className="flex-1 w-full py-3 px-4">
          {/* 4. The Actual Input */}
          <input
            {...props}
            ref={inputRef}
            id={id}
            name={id}
            autoComplete="new-password"
            type={currentInputType}
            value={value || ""}
            onChange={handleInputChangeWrapper}
            onFocus={handleInputFocus}
            onBlur={handleInputBlurWrapper}
            placeholder={isFloating ? placeholder : ""}
            className="w-full border-none bg-transparent p-0 text-base text-gray-900 dark:text-slate-100 outline-none ring-0 focus:ring-0"
          />
        </div>

        {/* 5. Password Toggle Icon (unchanged) */}
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="px-4 text-gray-500 dark:text-slate-400"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isPasswordVisible ? "eye" : "eye-off"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
              >
                {isPasswordVisible ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        )}
      </div>

      {/* 6. The Error Message (unchanged) */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            className="text-sm text-red-500"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
          >
            {_.get(errors, id)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextInput;
