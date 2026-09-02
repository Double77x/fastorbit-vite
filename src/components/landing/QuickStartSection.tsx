import { useState } from "react";
import { Copy, Check, Terminal, ExternalLink } from "lucide-react";

import { Grid } from "@/components/layout/Grid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { toast } from "sonner";

const cloneCmd = `git clone ${siteConfig.links.github}.git
cd fastorbit-vite
pnpm install
pnpm dev`;

const QuickStartSection = () => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(cloneCmd);
      setCopied(true);
      toast.success("Clone command copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Grid variant='default' topDivider>
      <section id='quick-start' className='col-span-12 scroll-mt-24'>
        <SectionHeading
          title='Quick start'
          accent='in 30 seconds'
          description='Clone, install and ship. TanStack Start SSG on Cloudflare Pages — zero server, instant CDN.'
        />

        <div className='mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-5'>
          <div className='order-2 space-y-4 lg:order-1 lg:col-span-3'>
            <div className='overflow-hidden rounded-md border-hairline bg-surface-1'>
              <div className='flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2.5'>
                <span className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                  <Terminal className='size-3.5' />
                  Terminal
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onCopy}
                  className='h-7 gap-1.5 px-2 text-xs'
                  aria-label='Copy clone command'>
                  {copied ? <Check className='size-3.5 text-primary' /> : <Copy className='size-3.5' />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className='overflow-x-auto bg-muted p-4 font-mono text-xs leading-6 text-foreground'>
                <code>{cloneCmd}</code>
              </pre>
            </div>

            <div className='flex flex-wrap gap-2'>
              <a href={siteConfig.links.github} target='_blank' rel='noopener noreferrer'>
                <Button variant='outline' size='sm' className='gap-1.5'>
                  <ExternalLink className='size-4' />
                  View on GitHub
                </Button>
              </a>
              <a href={`${siteConfig.links.github}#readme`} target='_blank' rel='noopener noreferrer'>
                <Button variant='ghost' size='sm'>
                  Read docs
                </Button>
              </a>
            </div>
          </div>

          <div className='order-1 space-y-3 lg:order-2 lg:col-span-2'>
            <ol className='space-y-3 text-sm'>
              <li className='flex gap-3'>
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'>
                  1
                </span>
                <span className='pt-0.5 leading-relaxed text-muted-foreground'>
                  <span className='font-medium text-foreground'>Clone</span> the starter — includes Router, Query,
                  Charts, Table, Virtual + Base UI.
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'>
                  2
                </span>
                <span className='pt-0.5 leading-relaxed text-muted-foreground'>
                  <span className='font-medium text-foreground'>pnpm dev</span> at :8080,{" "}
                  <span className='font-medium text-foreground'>pnpm build</span> prerenders to{" "}
                  <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>dist/</code> for Pages.
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'>
                  3
                </span>
                <span className='pt-0.5 leading-relaxed text-muted-foreground'>
                  Deploy <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>dist/</code> to Cloudflare
                  Pages — edge CDN, no server.
                </span>
              </li>
            </ol>
            <p className='pt-2 text-xs leading-relaxed text-muted-foreground'>
              Needs Node 20+, pnpm. Open-Meteo needs no key — just `fetchWeather` via{" "}
              <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>useWeather</code>.
            </p>
          </div>
        </div>
      </section>
    </Grid>
  );
};

export default QuickStartSection;
