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

export const BASE_URL = 'https://api.padlupp.com/api-v1'
