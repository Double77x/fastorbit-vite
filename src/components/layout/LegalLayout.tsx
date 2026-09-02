import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/Seo";
import { Grid, GridCell } from "@/components/layout/Grid";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface LegalLayoutProps {
  title: string;
  description: string;
  keywords?: string[];
  children: ReactNode;
}

export const LegalLayout = ({ title, description, keywords, children }: LegalLayoutProps) => {
  const location = useLocation();

  // Breadcrumb data for both UI and SEO
  const breadcrumbItems = [{ label: title, href: location.pathname }];

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SEO title={title} description={description} keywords={keywords} breadcrumbItems={breadcrumbItems} />
      <Navbar />

      <main className='flex-1'>
        <Grid padding='none' corners='none' className='pt-28 sm:pt-32 md:pt-36'>
          {/* Breadcrumbs — above the box, aligned to the content column (same max-w-4xl as header) */}
          <GridCell className='col-span-12'>
            <div className='mx-auto w-full max-w-4xl'>
              <Breadcrumb items={breadcrumbItems} className='animate-fade-in-right' />
            </div>
          </GridCell>

          {/* Box top edge — full-width hairline to the vertical grid lines, "+" at corners */}
          <div aria-hidden className='relative col-span-12 mt-6 h-px bg-border md:mt-8'>
            <span className='grid-plus left-0 top-0' />
            <span className='grid-plus right-0 top-0' />
          </div>

          {/* Page header — inside the box (tight, equal padding) */}
          <GridCell className='col-span-12 py-4 md:py-5'>
            <div className='mx-auto w-full max-w-4xl'>
              <h1 className='text-4xl font-semibold tracking-tight leading-none'>{title}</h1>
            </div>
          </GridCell>

          {/* Hairline under the title — full-width to the vertical grid lines, "+" at corners */}
          <div aria-hidden className='relative col-span-12 h-px bg-border'>
            <span className='grid-plus left-0 top-0' />
            <span className='grid-plus right-0 top-0' />
          </div>

          {/* Page content — inside the box */}
          <GridCell className='col-span-12 pt-6 pb-12 md:pt-8 md:pb-16'>
            <div className='mx-auto w-full max-w-4xl'>
              <div className='max-w-none delay-100 animate-fade-in'>{children}</div>
            </div>
          </GridCell>

          {/* Box bottom edge — full-width hairline lands at the footer junction, "+" at corners */}
          <div aria-hidden className='relative col-span-12 h-px bg-border'>
            <span className='grid-plus left-0 bottom-0' />
            <span className='grid-plus right-0 bottom-0' />
          </div>
        </Grid>
      </main>

      <Footer />
    </div>
  );
};
