// src/components/AuthLeftPanel.tsx
import React from "react";
import logo from "@/assets/images/logo.png";
import bti from "@/assets/images/auth_frame_b.png";
import { motion } from "framer-motion";

// Internal component for the floating cards to keep this file self-contained
const FloatingCard: React.FC<{
  title: string;
  items: string[];
  className?: string;
}> = ({ title, items, className }) => (
  <div
    className={`bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xl p-4 w-60 text-gray-900 dark:text-slate-100 border border-transparent dark:border-slate-700 ${className}`}
  >
    <h3 className="text-xs font-medium text-gray-600 dark:text-slate-300 mb-3">{title}</h3>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-xs">{item}</span>
          </div>
          <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const AuthLeftPanel: React.FC = () => {
  return (
    // The main container with the gradient and relative positioning
    <div className="relative flex flex-col justify-start w-full h-full bg-linear-to-b from-[#A3CBFA] to-[#4E92F4] dark:from-slate-900 dark:to-slate-800 text-white p-12 overflow-hidden">
      {/* Logo */}
      <img src={logo} alt="logo" className="w-auto h-14 object-contain" />

      {/* Text Content */}
      <motion.div
        className="z-10 mt-24"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="text-3xl font-semibold mb-4">Sign up and get started</h1>
        <p className="text-base text-blue-100 max-w-sm">
          One step to organize your goals, collaborate with friends, and stay on
          track.
        </p>
      </motion.div>

      {/* Decorative UI Cards */}
      <div className="absolute bottom-0 left-0 w-full h-2/3 z-10">
        <motion.div
          className="absolute left-16 bottom-24"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, delay: 0.7 }}
        >
          <FloatingCard
            title="Things to do"
            items={["📋", "🤝", "🏆"]}
            className="shadow-2xl"
          />
        </motion.div>
        <motion.div
          className="absolute left-40 bottom-48"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, delay: 0.5 }}
        >
          <FloatingCard
            title="Conversations"
            items={["🧑‍", "👩‍", "🧑‍🦰"]}
            className="shadow-lg"
          />
        </motion.div>
      </div>

      {/* Wavy Blob Graphic */}
      {/* This element is an abstract 3D shape, not easily reproducible
        with pure Tailwind. In a real project, this would be an <img /> 
        or <svg> tag.
      */}
      <div className="absolute bottom-0 right-0  z-0">
        <img src={bti} alt="bottom image" className="h-64 object-contain" />
      </div>
    </div>
  );
};
