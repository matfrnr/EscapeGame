import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...classes) => twMerge(clsx(...classes));

export const containSpaces = (str) => {
  // Check if the string contains spaces with regex
  return /\s/.test(str);
};
