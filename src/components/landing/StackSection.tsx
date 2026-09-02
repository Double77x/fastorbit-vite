import {
  Layers,
  Router,
  Database,
  Table2,
  PanelsTopLeft,
  Palette,
  Wind,
  Shield,
  Boxes,
  Rocket,
  Keyboard,
  ShieldCheck,
} from "lucide-react";

import { Grid } from "@/components/layout/Grid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";

const getVersion = (name: string) => {
  const map: Record<string, string> = {
    "@tanstack/react-router": "1.170",
    "@tanstack/react-start": "1.168",
    "@tanstack/react-query": "5.102",
    "@tanstack/react-table": "9.1",
    "@tanstack/react-virtual": "3.14",
    "@tanstack/charts": "0.15",
    "@tanstack/react-hotkeys": "0.10",
    "@base-ui/react": "1.7",
    tailwindcss: "4.3",
    vite: "8.2",
    zod: "4.4",
  };
  return map[name] ?? "—";
};

const stack = [
  {
    icon: Router,
    title: "TanStack Router",
    desc: "Type-safe file-based routing with search validation, preload intent and scroll restoration.",
    badge: getVersion("@tanstack/react-router"),
    href: "https://tanstack.com/router",
  },
  {
    icon: Rocket,
    title: "TanStack Start",
    desc: "SSG prerender (crawlLinks) to static HTML for Cloudflare Pages — CDN first paint, hydrate after.",
    badge: getVersion("@tanstack/react-start"),
    href: "https://tanstack.com/start",
  },
  {
    icon: Database,
    title: "TanStack Query",
    desc: "Server state with Zod-validated fetch, 5m stale, keepPreviousData — no useEffect fetch.",
    badge: getVersion("@tanstack/react-query"),
    href: "https://tanstack.com/query",
  },
  {
    icon: Table2,
    title: "TanStack Table",
    desc: "Headless sorting via createColumnHelper + getSortedRowModel — v9 legacy bridge, no getCanSort crash.",
    badge: getVersion("@tanstack/react-table"),
    href: "https://tanstack.com/table",
  },
  {
    icon: PanelsTopLeft,
    title: "TanStack Virtual",
    desc: "Windowed combobox for 20 locations (scales to 150+). Fixed row heights, stable keys, no CLS.",
    badge: getVersion("@tanstack/react-virtual"),
    href: "https://tanstack.com/virtual",
  },
  {
    icon: Layers,
    title: "TanStack Charts",
    desc: "Declarative lineY + dot, catppuccin pink/mauve gradients, portaled tooltip — theme-aware.",
    badge: getVersion("@tanstack/charts"),
    href: "https://tanstack.com/charts",
  },
  {
    icon: Keyboard,
    title: "TanStack Hotkeys",
    desc: "Declarative hotkeys (Mod+K, /, Esc) for command palette — scoped, no global listeners.",
    badge: getVersion("@tanstack/react-hotkeys"),
    href: "https://tanstack.com/hotkeys",
  },
  {
    icon: ShieldCheck,
    title: "Zod",
    desc: "Runtime schema validation for search, weather API and env — parse, don’t validate.",
    badge: getVersion("zod"),
    href: "https://zod.dev",
  },
  {
    icon: Boxes,
    title: "Base UI + shadcn",
    desc: "Accessible primitives (Dialog, Combobox, Select) rewired from Radix — no @radix-ui deps.",
    badge: getVersion("@base-ui/react"),
    href: "https://base-ui.com",
  },
  {
    icon: Palette,
    title: "Tailwind v4",
    desc: "@tailwindcss/vite, @theme tokens, semantic --primary pink (#ea76cb / #f5c2e7) + glow.",
    badge: getVersion("tailwindcss"),
    href: "https://tailwindcss.com",
  },
  {
    icon: Wind,
    title: "Vite + Wrangler",
    desc: "Vite 8 + oxc minify, visualizer, Cloudflare Pages output dist/ — pnpm dev :8080, build SSG.",
    badge: getVersion("vite"),
    href: "https://vitejs.dev",
  },
  {
    icon: Shield,
    title: "Security & a11y",
    desc: "CSP in _headers (open-meteo allow), _redirects fallback, axe-core Playwright, oxlint + fallow.",
    badge: "CSP",
    href: "/legal/security",
  },
];

const StackSection = () => {
  return (
    <Grid variant='default' topDivider>
      <section id='stack' className='col-span-12 scroll-mt-24'>
        <SectionHeading
          title='Full stack'
          accent='architecture'
          description='Every piece is type-safe, theme-aware and SSG-ready. Copy this pattern for your own TanStack + Cloudflare starter.'
        />

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {stack.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={`${item.title} — ${item.desc}`}
              className='group flex flex-col gap-3 rounded-md border-hairline bg-surface-1 p-5 transition-colors hover:border-hairline-strong hover:bg-surface-2'>
              <div className='flex items-start justify-between gap-3'>
                <span className='flex size-9 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/15'>
                  <item.icon className='size-5 text-primary' />
                </span>
                <Badge variant='outline' className='rounded-md font-mono text-xs'>
                  {item.badge}
                </Badge>
              </div>
              <div>
                <h3 className='text-sm font-semibold tracking-tight text-foreground'>{item.title}</h3>
                <p className='mt-1.5 text-xs leading-relaxed text-muted-foreground'>{item.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <div className='mx-auto mt-8 max-w-3xl rounded-md border-hairline bg-muted p-4 text-xs leading-relaxed text-muted-foreground'>
          <p className='font-medium text-foreground'>Architecture notes</p>
          <ul className='mt-2 list-disc space-y-1 pl-4'>
            <li>
              No <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>useEffect</code> for data —{" "}
              <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>useWeather</code> is pure{" "}
              <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>useQuery</code> with Zod.
            </li>
            <li>
              Search param <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>?location=london</code> is
              TanStack Router validateSearch — shareable, back-button correct, wired to{" "}
              <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>CTRL+K</code>.
            </li>
            <li>
              Select virtualization via{" "}
              <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>@tanstack/react-virtual</code> inside Base UI
              Combobox — not Select (see ColumnPicker threshold 150).
            </li>
            <li>
              Skeletons use <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>keepPreviousData</code> + fixed
              <code className='rounded bg-surface-1 px-1 py-0.5 font-mono'>min-h-80</code> so switching locations
              doesn’t shift layout.
            </li>
          </ul>
        </div>
      </section>
    </Grid>
  );
};

export default StackSection;
