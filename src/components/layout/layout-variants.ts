export type SectionVariant = "default" | "muted" | "inset";

export const variantClasses: Record<SectionVariant, string> = {
  default: "bg-background",
  muted: "bg-surface-2",
  inset: "bg-surface-3",
};

export const paddingClasses: Record<"none" | "sm" | "md" | "lg", string> = {
  none: "",
  sm: "py-12 md:py-16",
  md: "py-16 md:py-20",
  lg: "py-16 md:py-24 lg:py-28",
};

// fallow-ignore-next-line unused-export -- retained for future Zone/Grid reuse
export const zonePadding = "py-12 md:py-16 lg:py-20";
