import { LegalLayout } from "@/components/layout/LegalLayout";
import { Prose } from "@/components/layout/Prose";
import { LEGAL_META } from "@/data/legal";

export default function ChangelogPage() {
  const meta = LEGAL_META.changelog;
  return (
    <LegalLayout title={meta.title} description={meta.description} keywords={meta.keywords}>
      <Prose>
        <div className='border-l-2 border-primary pb-2 pl-6'>
          <h2 className='text-2xl font-semibold'>v0.1.0 — Fast Orbit launch</h2>
          <p className='mb-4 text-sm text-muted-foreground'>2 September 2026</p>
          <ul className='list-inside list-disc space-y-2 text-foreground'>
            <li>TanStack Start SSG starter on Cloudflare Pages — file-based routing and static prerender</li>
            <li>TanStack Query, Table, Virtual, Charts and Hotkeys wired with Zod and keepPreviousData</li>
            <li>Base UI + shadcn primitives, Tailwind v4 and Catppuccin pink tokens</li>
            <li>Self-hosted Poppins and theme-aware hero with flower morph trail</li>
            <li>Live weather demo with virtualized location search and URL search param</li>
            <li>Quick start, stack overview and a11y, lint and Fallow quality gates</li>
          </ul>
        </div>
      </Prose>
    </LegalLayout>
  );
}
