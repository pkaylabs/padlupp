// src/components/onboarding/Step3ProfileImage.tsx
import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/core/buttons";
import { useNavigate } from "@tanstack/react-router";
import { DASHBOARD } from "@/constants/page-path";

interface Step3Props {
  onFinish: (file: File | null) => void;
}

export const Step3ProfileImage: React.FC<Step3Props> = ({ onFinish }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  // Clean up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Trigger the hidden file input
  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        customize your experience
      </h1>
      <p className="text-gray-500 mb-8">Add profile image</p>

      {/* The Image Uploader */}
      <div className="mb-8">
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          className="hidden"
        />

        {/* Conditional rendering for empty (Step 3) vs preview (Step 4) */}
        {!preview ? (
          // Empty State (Screenshot 3)
          <motion.button
            onClick={triggerFileInput}
            className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={40} />
          </motion.button>
        ) : (
          // Preview State (Screenshot 4)
          <motion.div
            onClick={triggerFileInput}
            className="w-40 h-40 rounded-lg overflow-hidden shadow-lg cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </div>

      <Button
        variant="primary"
        onClick={() => onFinish(file)}
        className="w-full"
      >
        Finish up
      </Button>
      <button
        onClick={() => {
          onFinish(null);
          navigate({ to: DASHBOARD });
        }}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Skip for now.
      </button>
    </div>
  );
};
