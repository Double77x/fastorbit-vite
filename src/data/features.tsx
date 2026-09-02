import React from "react";
import { Router, Database, Table2, Layers, Palette, ShieldCheck } from "lucide-react";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const features: FeatureItem[] = [
  {
    icon: <Router className='size-6 text-primary' />,
    title: "Type-safe routing",
    description: "File-based routes with search validation and intent preload. No string URLs, no mismatched params.",
  },
  {
    icon: <Database className='size-6 text-primary' />,
    title: "Query caching",
    description:
      "Zod-validated fetch with staleTime, keepPreviousData and no useEffect. Data stays on screen while it refreshes.",
  },
  {
    icon: <Table2 className='size-6 text-primary' />,
    title: "Tables and lists",
    description:
      "Headless Table for sorting and filtering, Virtual for windowed lists. Fixed heights, stable keys, no shift.",
  },
  {
    icon: <Layers className='size-6 text-primary' />,
    title: "Charts that scale",
    description:
      "Declarative line, area and dot marks with shared scales and portaled tooltips. Theme-aware from the start.",
  },
  {
    icon: <Palette className='size-6 text-primary' />,
    title: "Base UI + Tailwind v4",
    description:
      "Accessible dialog, combobox and select via Base UI. Tokens live in @theme, pink in both light and dark.",
  },
  {
    icon: <ShieldCheck className='size-6 text-primary' />,
    title: "Shipped to check itself",
    description:
      "oxlint, react-doctor, Fallow and Playwright axe run on every build. Prerender fails if a route breaks.",
  },
];
