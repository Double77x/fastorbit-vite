/**
 * Single source of truth for legal / compliance pages.
 * Pages, SEO, Footer and CommandPalette should derive titles / descriptions / keywords from here
 * to avoid drift between route meta and searchable palette items.
 */

export type LegalSlug = "privacy" | "terms" | "cookies" | "security" | "changelog";

export interface LegalMeta {
  slug: LegalSlug;
  title: string;
  description: string;
  keywords: string[];
  lastUpdated?: string;
}

export const LEGAL_META: Record<LegalSlug, LegalMeta> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How Fast Orbit collects, uses and protects your personal data.",
    keywords: ["privacy policy", "data protection", "user privacy", "data collection", "information security"],
    lastUpdated: "2 September 2026",
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    description: "The terms for using Fast Orbit, including your rights and responsibilities.",
    keywords: ["terms of service", "user agreement", "legal information", "usage rights", "responsibilities"],
    lastUpdated: "2 September 2026",
  },
  cookies: {
    slug: "cookies",
    title: "Cookie Policy",
    description: "The cookies Fast Orbit uses and how you can control them.",
    keywords: ["cookies", "cookie policy", "browser storage", "user tracking", "data privacy"],
    lastUpdated: "2 September 2026",
  },
  security: {
    slug: "security",
    title: "Security",
    description: "How Fast Orbit keeps your data safe with client-side processing and secure infrastructure.",
    keywords: [
      "data security",
      "client-side processing",
      "privacy-first",
      "secure visualisation",
      "infrastructure safety",
    ],
  },
  changelog: {
    slug: "changelog",
    title: "Changelog",
    description: "New features, improvements and fixes in Fast Orbit.",
    keywords: ["changelog", "product updates", "new features", "release notes", "version history"],
  },
};
