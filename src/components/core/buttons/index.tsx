import { cn } from "@/utils/cs";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";
import { motion } from "framer-motion";

interface ButtonProps
  // This is the updated line
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"
    >,
    VariantProps<typeof buttonVariants> {}

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  className,
  variant,
  size,
  ...props
}) => {
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;

const buttonVariants = cva(
  "w-full flex justify-center items-center font-semibold rounded-lg transition-all duration-200 focus:outline-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#4E92F4] text-white hover:bg-[#3278DE] focus:ring-4 focus:ring-blue-300",
        secondary:
          "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100",
        outline:
          "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100",
        danger:
          "border-none text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300",
      },
      size: {
        sm: "text-sm px-3 py-2",
        md: "text-base px-4 py-3",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
