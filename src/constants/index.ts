import {
  BUDDY_FINDER,
  DASHBOARD,
  GOALS,
  MESSAGES,
} from "@/constants/page-path";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { CiLinkedin } from "react-icons/ci";
import { MdOutlineDashboard } from "react-icons/md";
import { ListTodo, Mail } from "lucide-react";
import { PiUsersThree } from "react-icons/pi";

export const navigation = [
  { name: "Dashboard", href: DASHBOARD, icon: MdOutlineDashboard },
  { name: "Goals", href: GOALS, icon: ListTodo },
  { name: "Messages", href: MESSAGES, icon: Mail },
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
  { label: "Privacy Policy", href: "#" },
  { label: "Terms and Condition", href: "#" },
  { label: "Contact", href: "#" },
];

export const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];

export const BASE_URL = "https://api.padlupp.com/api-v1";

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

export const INTERESTS_LIST = [
  "Painting",
  "Sculpting",
  "Writing",
  "Drawing",
  "Journaling",
  "Filmmaking",
  "Photography",
  "Sewing",
  "Animation",
  "Hiking",
  "Pottery",
  "Scrapbooking",
  "Running",
  "Stargazing",
  "Cycling",
  "Weightlifting",
  "Pilates",
  "Soccer",
  "CrossFit",
  "Tennis",
  "Boxing",
  "Coding/Programming",
  "Yoga",
  "Swimming",
  "3D Printing",
  "Web Development",
  "Theater",
  "Basketball",
  "Singing",
  "Dancing",
];

export const PROMPTS_LIST = [
  "A goal I'm working on right now is...",
  "My dream achievement is...",
  "One thing I want to master this year is...",
  "I feel most accomplished when I...",
  "My favorite way to stay focused is...",
  "The best productivity hack I've learned is...",
  "I stay inspired by...",
];
