import { useEffect, useRef, useState } from "react";
import { CloudSun, Database, LineChart, Table2, RefreshCw, AlertCircle, MapPin } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { Grid, GridCell } from "@/components/layout/Grid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WEATHER_LOCATIONS, type WeatherLocation } from "@/data/locations";
import { useWeather } from "@/hooks/use-weather";
import { formatWeatherCode } from "@/lib/weather-api";
import { LocationPicker } from "./LocationPicker";
import { WeatherChart } from "./WeatherChart";
import { WeatherTable } from "./WeatherTable";
import { WeatherSectionSkeleton } from "./WeatherSectionSkeleton";

const DEFAULT_LOCATION = WEATHER_LOCATIONS[0];

const WeatherSectionInner = () => {
  const search = useSearch({ from: "/" } as never) as { location?: string };
  const navigate = useNavigate();
  const locId = search.location ?? DEFAULT_LOCATION.id;
  const location = WEATHER_LOCATIONS.find((l) => l.id === locId) ?? DEFAULT_LOCATION;

  const setLocation = (next: WeatherLocation) => {
    navigate({
      // @ts-expect-error search type loosely typed for home route
      search: (prev: Record<string, unknown>) => ({ ...prev, location: next.id }),
      resetScroll: false,
    });
  };

  const query = useWeather(location);

  const prevLocRef = useRef<string | null>(null);
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (query.isSuccess) prevLocRef.current = location.id;
      return;
    }
    if (query.isSuccess && query.data && prevLocRef.current !== location.id) {
      const isForCurrent =
        Math.abs(query.data.location.lat - location.lat) < 0.02 &&
        Math.abs(query.data.location.lon - location.lon) < 0.02;
      if (!isForCurrent) return;
      const temp =
        query.data.current?.temperature !== null && query.data.current?.temperature !== undefined
          ? `${query.data.current.temperature.toFixed(1)}${query.data.units.temp}`
          : null;
      const desc = formatWeatherCode(query.data.current?.weatherCode ?? null);
      toast.success(`Weather for ${location.label}`, {
        description: temp ? `${temp} · ${desc}` : desc,
      });
      prevLocRef.current = location.id;
    } else if (query.isSuccess && prevLocRef.current === null) {
      prevLocRef.current = location.id;
    }
  }, [query.isSuccess, query.data, location]);

  // oxlint-disable-next-line react-doctor/no-locale-format-in-render -- client-only updatedAt, SSR renders null so no mismatch
  const updatedAt = query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toLocaleTimeString("en-GB") : null;

  const isInitialLoading = query.isPending && !query.data;

  return (
    <section id='weather' className='scroll-mt-24'>
      <Grid variant='muted' topDivider>
        <SectionHeading
          title='Powered by'
          accent='TanStack'
          description='A live showcase of our architectural stack — TanStack Query for server state, TanStack Charts for visualization, TanStack Table for data grids, and TanStack Virtual for performant lists. All client-side, SSG-ready on Cloudflare Pages.'
        />

        {/* Controls row */}
        <GridCell className='col-span-12 flex flex-col gap-4 rounded-md border-hairline bg-surface-1 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6'>
          <div className='flex-1 space-y-2'>
            <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
              Location · 20 major cities · virtualized search
            </p>
            <LocationPicker locations={WEATHER_LOCATIONS} value={location} onValueChange={setLocation} />
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Search and switch cities. Data refetches via{" "}
              <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>useWeather</code> ·{" "}
              <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>open-meteo.com</code> · no API key.
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <Badge
              variant='outline'
              className='inline-flex size-8 items-center justify-center rounded-md p-0 font-mono text-xs'
              title={`${location.lat}, ${location.lon}`}>
              <MapPin className='size-3.5' aria-hidden />
            </Badge>
            <span className='hidden font-mono text-xs text-muted-foreground sm:inline'>
              {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className='size-8 p-0'
              aria-label='Refetch weather'>
              <RefreshCw className={`size-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </GridCell>

        {/* Three pillars */}
        <GridCell className='col-span-12 lg:col-span-4'>
          <Card className='flex h-full flex-col border-hairline bg-surface-1'>
            <CardContent className='flex flex-1 flex-col gap-4 p-6'>
              <div className='flex items-center gap-2'>
                <span className='flex size-9 items-center justify-center rounded-md bg-primary/10'>
                  <Database className='size-5 text-primary' />
                </span>
                <div>
                  <h3 className='text-sm font-semibold'>TanStack Query</h3>
                  <p className='text-xs text-muted-foreground'>Server state</p>
                </div>
                <Badge
                  variant='secondary'
                  className='ml-auto inline-flex size-8 items-center justify-center rounded-md p-0 font-mono text-xs leading-none'>
                  {query.isPending ? "…" : query.isFetching ? "⟳" : query.isError ? "!" : "✓"}
                </Badge>
              </div>

              <div className='min-h-80 flex-1'>
                {isInitialLoading && (
                  <div className='space-y-3'>
                    <div className='h-24 animate-pulse rounded-md bg-muted' />
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='h-16 animate-pulse rounded-md bg-muted' />
                      <div className='h-16 animate-pulse rounded-md bg-muted' />
                      <div className='h-16 animate-pulse rounded-md bg-muted' />
                      <div className='h-16 animate-pulse rounded-md bg-muted' />
                    </div>
                    <div className='h-12 animate-pulse rounded-md bg-muted' />
                  </div>
                )}

                {query.isError && !isInitialLoading && (
                  <div className='flex gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3'>
                    <AlertCircle className='size-5 shrink-0 text-destructive' />
                    <div className='space-y-1'>
                      <p className='text-sm font-medium text-destructive'>Fetch failed</p>
                      <p className='text-xs leading-relaxed text-muted-foreground'>
                        {(query.error as Error)?.message ?? "Unknown error"}
                      </p>
                      <Button size='sm' variant='outline' onClick={() => query.refetch()} className='mt-2 h-7 text-xs'>
                        Retry
                      </Button>
                    </div>
                  </div>
                )}

                {query.data && (
                  <div className={`space-y-4 ${query.isFetching ? "opacity-70" : ""} transition-opacity`}>
                    <div className='rounded-md border-hairline bg-surface-2 p-4'>
                      <p className='text-xs tracking-wider text-muted-foreground uppercase'>
                        Current · {location.label}
                      </p>
                      <p className='mt-1 text-3xl font-semibold tracking-tight'>
                        {query.data.current?.temperature !== null && query.data.current?.temperature !== undefined
                          ? `${query.data.current.temperature.toFixed(1)}${query.data.units.temp}`
                          : "—"}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {formatWeatherCode(query.data.current?.weatherCode ?? null)}
                        {/* oxlint-disable-next-line eslint/eqeqeq -- nullish check for both null and undefined */}
                        {query.data.current?.humidity != null && ` · ${query.data.current?.humidity}% humidity`}
                      </p>
                      <p className='mt-2 text-xs text-muted-foreground'>
                        Wind {query.data.current?.windSpeed ?? "—"} {query.data.units.wind}
                      </p>
                    </div>

                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div className='rounded-md border-hairline bg-muted/30 p-3'>
                        <p className='font-medium'>staleTime</p>
                        <p className='font-mono text-muted-foreground'>5 min</p>
                      </div>
                      <div className='rounded-md border-hairline bg-muted/30 p-3'>
                        <p className='font-medium'>gcTime</p>
                        <p className='font-mono text-muted-foreground'>10 min</p>
                      </div>
                      <div className='rounded-md border-hairline bg-muted/30 p-3'>
                        <p className='font-medium'>retry</p>
                        <p className='font-mono text-muted-foreground'>2</p>
                      </div>
                      <div className='rounded-md border-hairline bg-muted/30 p-3'>
                        <p className='font-medium'>updated</p>
                        <p className='font-mono text-muted-foreground'>{updatedAt ?? "—"}</p>
                      </div>
                    </div>

                    <p className='text-xs leading-relaxed text-muted-foreground'>
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>useWeather</code> wraps{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>useQuery</code> with Zod validation, 5
                      min stale, <code className='rounded bg-muted px-1 py-0.5 font-mono'>keepPreviousData</code> —
                      SSG-safe (no server fetch, hydrates client-side).
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </GridCell>

        <GridCell className='col-span-12 lg:col-span-8'>
          <Card className='flex h-full flex-col border-hairline bg-surface-1'>
            <CardContent className='flex flex-1 flex-col gap-4 p-6'>
              <div className='flex items-center gap-2'>
                <span className='flex size-9 items-center justify-center rounded-md bg-primary/10'>
                  <LineChart className='size-5 text-primary' />
                </span>
                <div>
                  <h3 className='text-sm font-semibold'>TanStack Charts</h3>
                  <p className='text-xs text-muted-foreground'>7-day forecast · line + dot</p>
                </div>
                <Badge
                  variant='outline'
                  className='ml-auto hidden size-8 items-center justify-center rounded-md p-0 font-mono text-xs sm:inline-flex'>
                  7d
                </Badge>
              </div>

              <div className='min-h-80 flex-1'>
                {isInitialLoading ? (
                  <div className='h-72 animate-pulse rounded-md bg-muted sm:h-80' />
                ) : query.isError ? (
                  <p className='py-8 text-center text-sm text-muted-foreground'>
                    Chart unavailable — fix the query first.
                  </p>
                ) : query.data ? (
                  <div className={query.isFetching ? "opacity-70 transition-opacity" : ""}>
                    <WeatherChart data={query.data} />
                    <p className='pt-4 text-xs leading-relaxed text-muted-foreground'>
                      Declarative <code className='rounded bg-muted px-1 py-0.5 font-mono'>defineChart</code> with{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>lineY</code> +{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>dot</code>, catppuccin pink{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>#f5c2e7</code> / mauve{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>#cba6f7</code> / sky{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>#89dceb</code>, portaled tooltip.
                    </p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </GridCell>

        <GridCell className='col-span-12'>
          <Card className='border-hairline bg-surface-1'>
            <CardContent className='space-y-4 p-6'>
              <div className='flex items-center gap-2'>
                <span className='flex size-9 items-center justify-center rounded-md bg-primary/10'>
                  <Table2 className='size-5 text-primary' />
                </span>
                <div>
                  <h3 className='text-sm font-semibold'>TanStack Table</h3>
                  <p className='text-xs text-muted-foreground'>Daily rows · sortable client-side</p>
                </div>
                <Badge
                  variant='outline'
                  className='ml-auto inline-flex size-8 items-center justify-center rounded-md p-0 font-mono text-xs'>
                  {query.data ? query.data.daily.length : "—"}
                </Badge>
              </div>

              <div className='min-h-70'>
                {isInitialLoading ? (
                  <div className='space-y-2'>
                    <div className='h-10 animate-pulse rounded-md bg-muted' />
                    <div className='h-48 animate-pulse rounded-md bg-muted' />
                  </div>
                ) : query.isError ? (
                  <p className='py-8 text-center text-sm text-muted-foreground'>Table unavailable.</p>
                ) : query.data ? (
                  <div className={query.isFetching ? "opacity-70 transition-opacity" : ""}>
                    <WeatherTable daily={query.data.daily} units={query.data.units} />
                    <p className='pt-4 text-xs leading-relaxed text-muted-foreground'>
                      Headless sorting via <code className='rounded bg-muted px-1 py-0.5 font-mono'>useReactTable</code>{" "}
                      + <code className='rounded bg-muted px-1 py-0.5 font-mono'>getSortedRowModel</code>. Table
                      virtualization via{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>@tanstack/react-virtual</code> is
                      demonstrated in the location picker above (scales beyond 150 items; threshold at{" "}
                      <code className='rounded bg-muted px-1 py-0.5 font-mono'>VIRTUAL_PICKER.THRESHOLD</code>) — here
                      the 7-row forecast renders without virtualization as intended.
                    </p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </GridCell>

        <GridCell className='col-span-12 flex justify-center pt-2'>
          <p className='max-w-3xl text-center text-xs leading-relaxed text-muted-foreground'>
            <CloudSun className='mr-1 inline size-3.5' />
            Open-Meteo forecast ·{" "}
            <a
              href='https://open-meteo.com'
              target='_blank'
              rel='noopener noreferrer'
              className='underline decoration-dotted underline-offset-2 hover:text-foreground'>
              open-meteo.com
            </a>{" "}
            · CC BY 4.0 · <code className='rounded bg-muted px-1 py-0.5 font-mono'>staleTime 5m</code> keeps data fresh
            without spamming the free API. This section is a barebones TanStack + TanStack Start SSG quick-start — copy
            this pattern for your own stack.
          </p>
        </GridCell>
      </Grid>
    </section>
  );
};

export const WeatherSection = () => {
  const [isClient, setIsClient] = useState(false);
  // oxlint-disable-next-line react/set-state-in-effect, react-hooks-js/set-state-in-effect -- client gate for prerender
  useEffect(() => setIsClient(true), []);
  if (!isClient) {
    return <WeatherSectionSkeleton />;
  }
  return <WeatherSectionInner />;
};
