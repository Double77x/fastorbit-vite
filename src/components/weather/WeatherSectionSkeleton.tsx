import { Grid, GridCell } from "@/components/layout/Grid";
import { SectionHeading } from "@/components/shared/SectionHeading";

/**
 * Static skeleton for the weather demo. Rendered during SSG prerender
 * (WeatherSection is client-gated) and as the Suspense fallback while the
 * lazily-loaded WeatherSection chunk downloads. Keep the skeleton in this
 * light module — importing it must NOT pull charts/table/virtual libs.
 */
export const WeatherSectionSkeleton = () => {
  return (
    <section id='weather' className='scroll-mt-24'>
      <Grid variant='muted' topDivider>
        <SectionHeading
          title='Powered by'
          accent='TanStack'
          description='A live showcase of our architectural stack — TanStack Query for server state, TanStack Charts for visualization, TanStack Table for data grids, and TanStack Virtual for performant lists. All client-side, SSG-ready on Cloudflare Pages.'
        />
        <GridCell className='col-span-12'>
          <div className='h-10 w-full max-w-md animate-pulse rounded-md bg-muted' />
        </GridCell>
        <GridCell className='col-span-12 lg:col-span-4'>
          <div className='min-h-80 animate-pulse rounded-md bg-muted' />
        </GridCell>
        <GridCell className='col-span-12 lg:col-span-8'>
          <div className='min-h-80 animate-pulse rounded-md bg-muted' />
        </GridCell>
        <GridCell className='col-span-12'>
          <div className='min-h-70 animate-pulse rounded-md bg-muted' />
        </GridCell>
      </Grid>
    </section>
  );
};
