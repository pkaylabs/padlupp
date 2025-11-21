import React from "react";
import { motion as m } from "framer-motion";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import _ from "lodash";
import { cn } from "@/utils/cs";

interface FilterDropdownProps<T = any> {
  id?: string;
  label?: string;
  required?: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  errors?: unknown;
  touched?: unknown;
}

const SelectDropdown: React.FC<FilterDropdownProps> = ({
  id,
  label,
  required,
  options,
  value,
  onChange,
  className,
  errors,
  touched,
}) => {
  const selectedOption = options?.find((opt) => opt.value === value) || null;
  return (
    <div className="">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label} {required && <span>*</span>}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className={cn("relative flex-1 ", className)}>
          <ListboxButton
            className={cn(
              "font-poppins font-light w-full cursor-default flex flex-1 justify-between items-center rounded-md bg-white py-3 pr-2 pl-3 text-left text-[#324054] border sm:text-sm md:text-base xl:text-lg",
              _.get(errors, id as string) && _.get(touched, id as string)
                ? "focus:ring-red-500 focus:border-red-500 border border-red-600"
                : "focus:ring-primary focus:border-primary border border-gray-300",
              className
            )}
          >
            <span className="truncate pr-6  max-w-sm">
              {selectedOption ? selectedOption.label : "Select an option"}
            </span>
            <ChevronUpDownIcon
              aria-hidden="true"
              className={cn(
                "size-5 self-center justify-self-end  sm:size-5",
                _.get(errors, id as string) && _.get(touched, id as string)
                  ? "text-red-600"
                  : "text-gray-500"
              )}
            />
          </ListboxButton>
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-none sm:text-sm">
            {options?.map((option, idx) => (
              <ListboxOption
                key={option.value}
                value={option.value}
                className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-primary-600 data-focus:text-white"
              >
                <m.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx + 1) * 0.05 }}
                  className="block truncate font-normal group-data-selected:font-semibold max-w-sm "
                >
                  {option.label ?? "No label"}
                </m.span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      {_.get(errors, id as string) && _.get(touched, id as string) ? (
        <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
          {_.get(errors, id as string)}
        </p>
      ) : null}
    </div>
  );
};

export default SelectDropdown;
