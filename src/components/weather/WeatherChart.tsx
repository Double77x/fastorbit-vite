import { useMemo } from "react";
import { Chart } from "@tanstack/charts/react";
import { defineChart, dot, lineY } from "@tanstack/charts";
import { scalePoint } from "@tanstack/charts/scales/point";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { portal } from "@tanstack/charts/tooltip/portal";
import { d3Curve } from "@tanstack/charts";
import { curveMonotoneX } from "d3-shape";

import type { WeatherData } from "@/lib/weather-api";
import { useElementSize } from "@/hooks/use-element-size";

interface WeatherChartProps {
  data: WeatherData;
}

export const WeatherChart = ({ data }: WeatherChartProps) => {
  const { ref, height } = useElementSize<HTMLDivElement>();

  const definition = useMemo(() => {
    const rows: { x: string; y: number; series: string }[] = [];
    for (const d of data.daily) {
      // oxlint-disable-next-line react-doctor/no-locale-format-in-render -- date is ISO from API, formatted with explicit locale to keep SSR stable
      const label = new Date(d.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      if (d.max !== null) rows.push({ x: label, y: d.max, series: "Max" });
      if (d.min !== null) rows.push({ x: label, y: d.min, series: "Min" });
    }

    const maxRows = rows.filter((r) => r.series === "Max");
    const minRows = rows.filter((r) => r.series === "Min");

    const curve = d3Curve(curveMonotoneX);

    return defineChart({
      marks: [
        lineY(maxRows, {
          x: "x",
          y: "y",
          stroke: "#f5c2e7",
          strokeWidth: 2.4,
          curve,
        }),
        dot(maxRows, { x: "x", y: "y", r: 3.5, fill: "#f5c2e7", stroke: "#ffffff", strokeWidth: 1.5 }),
        lineY(minRows, {
          x: "x",
          y: "y",
          stroke: "#89dceb",
          strokeWidth: 2.4,
          curve,
        }),
        dot(minRows, { x: "x", y: "y", r: 3.5, fill: "#89dceb", stroke: "#ffffff", strokeWidth: 1.5 }),
      ],
      scales: {
        x: {
          scale: () => scalePoint<string>().padding(0.5),
          axis: { label: "Date" },
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: { label: `Temp (${data.units.temp})` },
        },
      },
      color: {
        domain: ["Max", "Min"],
        range: ["#f5c2e7", "#89dceb"],
      },
      tooltip: {
        use: tooltip,
        className: "chart-tooltip",
        placement: "auto",
        offset: 10,
        sticky: true,
        portal: { use: portal },
      },
    });
  }, [data]);

  if (data.daily.length === 0) {
    return <p className='py-8 text-center text-sm text-muted-foreground'>No daily data available.</p>;
  }

  return (
    <div ref={ref} className='h-72 w-full sm:h-80'>
      {height > 0 && (
        <Chart definition={definition} ariaLabel='7-day temperature forecast' className='size-full' height={height} />
      )}
    </div>
  );
};
