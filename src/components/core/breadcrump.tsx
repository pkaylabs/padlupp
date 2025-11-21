// src/components/goals/Breadcrumb.tsx
import React from "react";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  path: string[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path }) => {
  return (
    <nav className="flex items-center text-sm font-medium">
      {path.map((item, index) => (
        <React.Fragment key={item}>
          <span
            className={
              index === path.length - 1 ? "text-gray-800" : "text-gray-500"
            }
          >
            {item}
          </span>
          {index < path.length - 1 && (
            <ChevronRight size={16} className="mx-1 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
