// src/components/goals/PeopleCardStack.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { type Person } from "@/constants/goals-data";
import Button from "@/components/core/buttons";
import { ArrowLeft2, ArrowRight2, QuoteDown } from "iconsax-reactjs";
import { PiTagSimpleDuotone } from "react-icons/pi";
import { UserAvatar } from "./user-avatar";

interface PeopleCardStackProps {
  people: Person[];
  onInvite: (person: Person) => void;
}

export const PeopleCardStack: React.FC<PeopleCardStackProps> = ({
  people,
  onInvite,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [people]);

  const person = people[index];

  const paginate = (direction: number) => {
    setIndex((prev) => (prev + direction + people.length) % people.length);
  };

  return (
    <div className="relative w-full mx-auto h-180">
      <AnimatePresence>
        <motion.div
          key={index}
          className="absolute w-full h-full"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className=" rounded-xl p-4 sm:p-6 pt-0 flex flex-col gap-3 items-center h-full">
            <div className="w-full flex gap-1.5 items-center bg-white dark:bg-slate-900 shadow p-4 sm:p-6 rounded-lg border border-transparent dark:border-slate-800">
              <span className="font-semibold text-[#3D3D3D] dark:text-slate-100">
                {person?.name}
              </span>
              <span className="size-1 rounded-full bg-primary-600" />
              <span className=" text-gray-500 dark:text-slate-400">{person?.age}</span>
            </div>

            <div className="relative">
              <UserAvatar
                src={person?.avatarUrl}
                name={person?.name}
                className="w-28 h-28 my-4"
                textClassName="text-2xl"
              />

              <div className="size-3 absolute z-20 bottom-4 right-6 p-px bg-white rounded-full">
                <div className=" bg-primary-500 size-full rounded-full" />
              </div>
            </div>

            <span className="text-[#F18E69] ">
              {person?.compatibility}% compatible
            </span>
            <div className="flex items-center gap-1.5 my-2">
              <span className="text-[#636363] dark:text-slate-300">Rating:</span>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < person?.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            <div className="w-full p-4 sm:p-6 py-8 bg-white dark:bg-slate-900 rounded-lg shadow text-sm text-gray-700 dark:text-slate-300 my-4 border border-transparent dark:border-slate-800">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="bg-primary-100/50 p-1 rounded-full ">
                  <QuoteDown size="15" color="#A3CBFA" variant="Bold" />
                </div>
                <span className="font-semibold text-sm text-dark-gray dark:text-slate-100">
                  Seeking for accountability on
                </span>
              </div>
              <span className="font-semibold text-base text-dark-gray dark:text-slate-200 pl-4">
                {person?.seeking}
              </span>
            </div>

            <div className=" w-full bg-white dark:bg-slate-900 rounded-xl px-4 sm:px-6 py-8 border border-transparent dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <PiTagSimpleDuotone size={18} color="#A3CBFA" />
                <span className="font-semibold text-base text-dark-gray dark:text-slate-100">
                  Interest
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 my-4">
                {person?.interests?.map((interest) => (
                  <div className="flex items-center bg-[#4E92F426] dark:bg-blue-500/20 gap-1.5 px-2.5 py-1 rounded-sm">
                    <interest.icon
                      size={16}
                      color="#141B34"
                      variant="TwoTone"
                    />
                    <span
                      key={interest?.interest}
                      className="text-xs font-medium text-gray-600 dark:text-slate-300"
                    >
                      {interest?.interest}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                className="absolute bottom-2 sm:bottom-12 left-1/2 -translate-x-1/2 w-60 -mt-8 text-white text-base font-semibold border-none bg-linear-to-r from-[#4E92F4] to-[#7938BE] hover:opacity-90 rounded-full "
                size="md"
                onClick={() => onInvite(person)}
              >
                Invite
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={() => paginate(-1)}
        className="absolute left-6 sm:left-0 top-1/2 -translate-y-1/2 -translate-x-10 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
      >
        <ArrowLeft2 variant="Bold" size={30} />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-6 sm:right-0 top-1/2 -translate-y-1/2 translate-x-10 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
      >
        <ArrowRight2 variant="Bold" size={30} />
      </button>
    </div>
  );
};
