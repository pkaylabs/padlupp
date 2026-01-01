// src/components/goals/CommunityCardStack.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { CommunityGoal, Person } from "@/constants/goals-data";
import Button from "@/components/core/buttons";
import { ArrowLeft2, ArrowRight2 } from "iconsax-reactjs";

interface CommunityCardStackProps {
  goals: CommunityGoal[];
  onInvite: (person: Person | null) => void;
}

export const CommunityCardStack: React.FC<CommunityCardStackProps> = ({
  goals,
  onInvite,
}) => {
  const [index, setIndex] = useState(0);
  const goal = goals[index];

  const paginate = (direction: number) => {
    setIndex((prev) => (prev + direction + goals.length) % goals.length);
  };

  return (
    <div className="relative w-full mx-auto h-[720px]">
      <AnimatePresence>
        <motion.div
          key={index}
          className="absolute w-full h-full"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="rounded-xl p-4 sm:p-6 pt-0 flex flex-col gap-3 items-center h-full">
            <div className="w-full flex gap-1.5 items-center bg-white shadow-md p-4 sm:p-6 rounded-lg">
              <span className="font-semibold text-[#3D3D3D]">{goal.title}</span>
            </div>

            <div className="relative ">
              <img
                src={goal.imageUrl}
                alt={goal.title}
                className="w-28 h-28 object-cover rounded-full my-4"
              />

              <div className="size-3 absolute z-20 bottom-4 right-6 p-px bg-white rounded-full">
                <div className=" bg-primary-500 size-full rounded-full" />
              </div>
            </div>

            <span className="text-base text-[#636363] mt-3">
              {goal.members} Members
            </span>
            <span className="text-base text-[#636363]">
              Progress level:{" "}
              <span className="text-base text-green-600 ">
                {goal.progress}%
              </span>
            </span>

            <div className="relative w-full p-4 sm:p-6 py-8 bg-white rounded-lg shadow-md text-sm text-gray-700 my-4">
              <h4 className="font-semibold text-dark-gray mb-5">Overview</h4>

              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-sm text-gray-700">Subtask</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <div className="flex text-primary-500 items-center gap-1">
                      <Calendar size={14} /> Due date
                    </div>
                    <div className="flex text-primary-500 items-center gap-1">
                      <Clock size={14} /> Due time
                    </div>
                  </div>
                </div>

                {goal.subtasks.map((task, i) => (
                  <div key={i}>
                    <p className="text-sm text-gray-700">{task.text}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <div className="flex text-primary-500 items-center gap-1">
                        <Calendar size={14} /> {task.due}
                      </div>
                      <div className="flex text-primary-500 items-center gap-1">
                        <Clock size={14} /> {task.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-60 text-white text-base font-semibold border-none bg-linear-to-r 
        from-[#4E92F4] to-[#7938BE] hover:opacity-90 rounded-full "
                size="md"
                onClick={() => onInvite(null)}
              >
                Join
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={() => paginate(-1)}
        className="absolute left-6 top-1/2 -translate-y-1/2 -translate-x-10 sm:p-2 rounded-full hover:bg-gray-100"
      >
        <ArrowLeft2 variant="Bold" size={30} />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-6 top-1/2 -translate-y-1/2 translate-x-10 sm:p-2 rounded-full hover:bg-gray-100"
      >
        <ArrowRight2 variant="Bold" size={30} />
      </button>
    </div>
  );
};
