import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const isLast = (index: number) => index === items.length - 1;

  return (
    <nav
      aria-label='Breadcrumb'
      className={cn(
        "inline-flex items-center rounded-full border-hairline bg-surface-2/80 p-1 backdrop-blur-sm",
        className,
      )}>
      <Link
        to='/'
        className='flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground'>
        <Home className='size-3.5' />
        Home
      </Link>

      {items.map((item, index) => {
        const current = isLast(index);
        return (
          <React.Fragment key={item.href || item.label}>
            <ChevronRight className='mx-0.5 size-3.5 shrink-0 text-muted-foreground/50' />
            {!current && item.href ? (
              <Link
                to={item.href}
                className='rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground'>
                {item.label}
              </Link>
            ) : (
              <span aria-current='page' className='rounded-full px-3 py-1.5 text-sm font-medium text-foreground'>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
