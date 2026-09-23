import { BUDDY_FINDER, GOALS, MESSAGES, PADDIE_PODS } from "@/constants/page-path";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { CiLinkedin } from "react-icons/ci";
import { ListTodo, Mail, UsersRound } from "lucide-react";
import { PiUsersThree } from "react-icons/pi";

export const navigation = [
  { name: "Goals", href: GOALS, icon: ListTodo },
  { name: "Messages", href: MESSAGES, icon: Mail },
	{ name: "Paddie Pods", href: PADDIE_PODS, icon: UsersRound },
  { name: "Buddy Finder", href: BUDDY_FINDER, icon: PiUsersThree },
  // { name: "Profile", href: PROFILE, icon: LuStethoscope },
];

export const socials = [
  { icon: CiFacebook, href: "#" },
  { icon: FaXTwitter, href: "#" },
  { icon: FaInstagram, href: "#" },
  { icon: AiOutlineYoutube, href: "#" },
  { icon: CiLinkedin, href: "#" },
];

export const legals = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];

const withoutTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const BASE_URL = withoutTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "https://api.padlupp.com/api-v1",
);

export const WS_BASE_URL = withoutTrailingSlash(
  import.meta.env.VITE_WS_BASE_URL ||
    BASE_URL.replace(/\/api-v1$/, "").replace(/^http/, "ws"),
);

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Portuguese",
  "Italian",
];

export const INTEREST_GROUPS = [
  {
    name: "Career & Business",
    interests: [
      "Job Search", "Career Growth", "Entrepreneurship", "Startup Building",
      "Freelancing", "Networking", "Public Speaking", "Project / Product Management",
      "Marketing / Digital Marketing", "Leadership",
    ],
  },
  {
    name: "Study & Learning",
    interests: [
      "Studying", "Reading", "Writing", "Language Learning", "Coding",
      "Web Development", "Data Science", "Artificial Intelligence", "Research",
      "Professional Certifications",
    ],
  },
  {
    name: "Health & Fitness",
    interests: [
      "Gym", "Running", "Walking", "Weight Loss", "Weightlifting", "Yoga",
      "Healthy Eating", "Meal Planning", "Meditation", "Sleep Improvement",
    ],
  },
  {
    name: "Personal Development",
    interests: [
      "Productivity", "Time Management", "Habit Building", "Goal Setting",
      "Journaling", "Self-Improvement", "Morning Routine", "Confidence Building",
      "Mindfulness", "Digital Detox",
    ],
  },
  {
    name: "Creative & Content",
    interests: [
      "Content Creation", "Photography", "Videography", "Graphic Design",
      "UI/UX Design", "Writing", "Podcasting", "Music", "Painting", "Animation",
    ],
  },
  {
    name: "Finance & Lifestyle",
    interests: [
      "Budgeting", "Saving Money", "Investing", "Side Hustles", "Financial Planning",
      "Cooking", "Home Organisation", "Travel Planning", "Volunteering", "Sustainability",
    ],
  },
] as const;

export const INTERESTS_LIST = INTEREST_GROUPS.flatMap((group) => group.interests);

export const PROMPTS_LIST = [
  "A goal I'm working on right now is...",
  "My dream achievement is...",
  "One thing I want to master this year is...",
  "I feel most accomplished when I...",
  "My favorite way to stay focused is...",
  "The best productivity hack I've learned is...",
  "I stay inspired by...",
];
