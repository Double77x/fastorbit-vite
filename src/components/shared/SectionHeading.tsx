import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  accent?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}

export const SectionHeading = ({ title, description, accent, align = "center", className }: SectionHeadingProps) => {
  return (
    <div className={cn(align === "center" && "text-center", "col-span-12 mb-8", className)}>
      <h2 className='mb-4 text-3xl font-semibold text-foreground md:text-4xl'>
        {title} {accent && <span className='text-primary'>{accent}</span>}
      </h2>
      {description && (
        <p
          className={cn(
            "text-muted-foreground",
            align === "center" ? "mx-auto max-w-2xl text-lg/relaxed" : "max-w-2xl",
          )}>
          {description}
        </p>
      )}
    </div>
  );
};
