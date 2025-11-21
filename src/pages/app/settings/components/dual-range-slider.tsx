// src/components/ui/DualRangeSlider.tsx
import React, { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css"; // Import default styles to override

interface DualRangeSliderProps {
  min: number;
  max: number;
  onChange: (values: [number, number]) => void;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  onChange,
}) => {
  const [values, setValues] = useState<[number, number]>([min + 5, max - 10]);

  const handleInput = (newValues: number[]) => {
    setValues([newValues[0], newValues[1]]);
    onChange([newValues[0], newValues[1]]);
  };

  return (
    <div className="w-full pt-4 pb-2">
      {/* We use a wrapper class 'custom-range-slider' to target this specific slider 
        in the style tag below without affecting others globally.
      */}
      <div className="custom-range-slider">
        <RangeSlider
          min={min}
          max={max}
          defaultValue={values}
          onInput={handleInput}
        />
      </div>

      {/* Labels below the slider */}
      <div className="flex justify-between mt-3 text-xs font-medium text-gray-400">
        <span>{values[0]}</span>
        <span>{values[1]}</span>
      </div>

      {/* Custom CSS to override the library's defaults */}
      <style>{`
        .custom-range-slider .range-slider {
          height: 6px;
          background-color: #E5E7EB; /* gray-200 */
          border-radius: 9999px;
        }

        /* The active blue bar between thumbs */
        .custom-range-slider .range-slider .range-slider__range {
          background-color: #3B82F6; /* blue-500 */
          border-radius: 9999px;
        }

        /* The Thumb (Circle) */
        .custom-range-slider .range-slider .range-slider__thumb {
          width: 20px;
          height: 20px;
          background-color: #3B82F6; /* blue-500 */
          border: 3px solid white;   /* The white ring */
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-radius: 50%;
          transition: transform 0.1s ease;
        }

        /* Hover/Active states for the thumb */
        .custom-range-slider .range-slider .range-slider__thumb:hover,
        .custom-range-slider .range-slider .range-slider__thumb[data-active] {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};
