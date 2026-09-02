import {
  Home,
  HelpCircle,
  Mail,
  SunMoon,
  History,
  Shield,
  FileText,
  Lock,
  Cookie,
  Rocket,
  Layers,
  CloudSun,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { LEGAL_META } from "@/data/legal";

export interface NavLink {
  to: string;
  label: string;
  id?: string;
}

export interface CommandItemStatic {
  id: string;
  title: string;
  category: "Tools" | "Sections" | "Legal" | "Actions";
  to?: string;
  icon: LucideIcon;
  synonyms: string[];
}

/** Main navbar links — single source for Navbar pill and scroll-spy. */
export const NAV_LINKS: NavLink[] = [
  { to: "/", label: "Home", id: "" },
  { to: "/#features", label: "Features", id: "features" },
  { to: "/#quick-start", label: "Quick Start", id: "quick-start" },
  { to: "/#stack", label: "Stack", id: "stack" },
  { to: "/#weather", label: "Demo", id: "weather" },
  { to: "/#faq", label: "FAQ", id: "faq" },
];

/** Footer column definitions — drives Footer.tsx rendering. */
export const FOOTER_PRODUCT_LINKS: NavLink[] = [
  { to: "/#quick-start", label: "Quick Start" },
  { to: "/#stack", label: "Stack" },
  { to: "/#weather", label: "Live Demo" },
  { to: "/legal/changelog", label: "Changelog" },
];

export const FOOTER_RESOURCES_LINKS: NavLink[] = [
  { to: "/", label: "Blog" },
  { to: "/", label: "Community" },
  { to: "/", label: "Help Center" },
  { to: "/", label: "Templates" },
];

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { to: "/legal/privacy", label: LEGAL_META.privacy.title },
  { to: "/legal/terms", label: LEGAL_META.terms.title },
  { to: "/legal/cookies", label: LEGAL_META.cookies.title },
  { to: "/legal/security", label: LEGAL_META.security.title },
];

/** Command palette static registry — CommandPalette.tsx merges with dynamic actions. */
export const COMMAND_STATIC_ITEMS: CommandItemStatic[] = [
  {
    id: "nav-home",
    title: "Home",
    category: "Sections",
    to: "/",
    icon: Home,
    synonyms: ["overview", "main", "landing"],
  },
  {
    id: "nav-features",
    title: "Features",
    category: "Sections",
    to: "/#features",
    icon: Sparkles,
    synonyms: ["features", "capabilities", "benefits", "why"],
  },
  {
    id: "nav-quick-start",
    title: "Quick Start",
    category: "Sections",
    to: "/#quick-start",
    icon: Rocket,
    synonyms: ["quick start", "clone", "install", "pnpm dev", "starter", "get started"],
  },
  {
    id: "nav-stack",
    title: "Stack Architecture",
    category: "Sections",
    to: "/#stack",
    icon: Layers,
    synonyms: ["stack", "architecture", "tanstack", "base ui", "shadcn", "tailwind", "cloudflare"],
  },
  {
    id: "nav-weather",
    title: "Live Weather Demo",
    category: "Sections",
    to: "/#weather",
    icon: CloudSun,
    synonyms: ["weather", "demo", "forecast", "open-meteo", "query", "charts", "table", "virtual"],
  },
  {
    id: "nav-faq",
    title: "Frequently Asked Questions",
    category: "Sections",
    to: "/#faq",
    icon: HelpCircle,
    synonyms: ["faq", "help", "questions", "answers", "support"],
  },
  {
    id: "nav-contact",
    title: "Contact",
    category: "Sections",
    to: "/#contact",
    icon: Mail,
    synonyms: ["contact", "email", "message", "support", "feedback"],
  },
  {
    id: "legal-changelog",
    title: LEGAL_META.changelog.title,
    category: "Legal",
    to: "/legal/changelog",
    icon: History,
    synonyms: ["changelog", "updates", "releases", "versions", "new", "features"],
  },
  {
    id: "legal-privacy",
    title: LEGAL_META.privacy.title,
    category: "Legal",
    to: "/legal/privacy",
    icon: Shield,
    synonyms: ["privacy", "gdpr", "data", "confidentiality", "security"],
  },
  {
    id: "legal-terms",
    title: LEGAL_META.terms.title,
    category: "Legal",
    to: "/legal/terms",
    icon: FileText,
    synonyms: ["terms", "conditions", "tos", "legal", "usage"],
  },
  {
    id: "legal-security",
    title: `${LEGAL_META.security.title} Overview`,
    category: "Legal",
    to: "/legal/security",
    icon: Lock,
    synonyms: ["security", "encryption", "client-side", "safety"],
  },
  {
    id: "legal-cookies",
    title: LEGAL_META.cookies.title,
    category: "Legal",
    to: "/legal/cookies",
    icon: Cookie,
    synonyms: ["cookies", "tracking", "storage"],
  },
];

export const COMMAND_ACTION_THEME: Omit<CommandItemStatic, "to"> & { id: "action-theme" } = {
  id: "action-theme",
  title: "Toggle Theme (Light / Dark)",
  category: "Actions",
  icon: SunMoon,
  synonyms: ["theme", "dark", "light", "mode", "color", "appearance"],
};
