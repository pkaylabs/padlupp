import { cn } from "@/utils/cs";
import { motion } from "framer-motion";


const ProgressBar = ({
  progress = 0,
  color = "#ffffff",
  secondaryColor,
  className,
}: {
  progress: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
}) => {
  return (
    <div
      style={{
        backgroundColor: secondaryColor ?? color + "19",
      }}
      className={cn("h-1 w-full rounded-full", className)}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${100 * progress}%` }}
        style={{ backgroundColor: color }}
        className="h-1 rounded-full"
      ></motion.div>
    </div>
  );
};

export default ProgressBar;
