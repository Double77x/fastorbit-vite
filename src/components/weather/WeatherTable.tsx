// oxlint-disable typescript/no-explicit-any -- v9 TableFeatures generics need any escape for DailyRow
import { useState, useMemo } from "react";
import {
  useTable,
  createCoreRowModel,
  createSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

import type { DailyRow } from "@/lib/weather-api";
import { cn } from "@/lib/utils";

// oxlint-disable-next-line typescript/no-explicit-any -- v9 now <TFeatures,TData>, keep DailyRow via any
const columnHelper = (createColumnHelper as unknown as () => ReturnType<typeof createColumnHelper<any, DailyRow>>)();

interface WeatherTableProps {
  daily: DailyRow[];
  units: { temp: string; precipitation: string; wind: string };
}

export const WeatherTable = ({ daily, units }: WeatherTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      // oxlint-disable-next-line typescript/no-explicit-any -- v9 sortFn string needs any cast
      columnHelper.accessor("date", {
        header: "Date",
        cell: (ctx: { getValue: () => unknown }) => {
          const v = ctx.getValue() as string;
          const d = new Date(v);
          // oxlint-disable-next-line react-doctor/no-locale-format-in-render -- date is ISO from API, explicit locale keeps SSR stable
          return d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
        },
        sortFn: "datetime" as unknown as string,
      } as any),
      columnHelper.accessor("max", {
        header: `Max (${units.temp})`,
        cell: (ctx) => (ctx.getValue() === null ? "—" : ctx.getValue()?.toFixed(1)),
        meta: { align: "right" },
      }),
      columnHelper.accessor("min", {
        header: `Min (${units.temp})`,
        cell: (ctx) => (ctx.getValue() === null ? "—" : ctx.getValue()?.toFixed(1)),
        meta: { align: "right" },
      }),
      columnHelper.accessor("precipitation", {
        header: `Precip. (${units.precipitation})`,
        cell: (ctx) => (ctx.getValue() === null ? "—" : ctx.getValue()?.toFixed(1)),
        meta: { align: "right" },
      }),
      columnHelper.accessor("windMax", {
        header: `Wind (${units.wind})`,
        cell: (ctx) => (ctx.getValue() === null ? "—" : ctx.getValue()?.toFixed(1)),
        meta: { align: "right" },
      }),
    ],
    [units],
  );

  // oxlint-disable-next-line typescript/no-explicit-any -- table v9 types need any escape for DailyRow
  const table = useTable({
    data: daily as unknown as any,
    columns: columns as any,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: createCoreRowModel(),
    getSortedRowModel: createSortedRowModel(),
  } as any);

  return (
    <div className='overflow-hidden rounded-md border-hairline bg-surface-1'>
      <div className='overflow-auto'>
        <table className='w-full caption-bottom text-sm'>
          <thead className='bg-muted/40'>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className='border-b'>
                {hg.headers.map((header) => {
                  const sortEntry = sorting.find((s) => s.id === header.column.id);
                  const sorted = sortEntry ? (sortEntry.desc ? "desc" : "asc") : false;
                  const align = (header.column.columnDef.meta as { align?: string } | undefined)?.align;
                  const handleSort = () => {
                    const id = header.column.id;
                    setSorting((old) => {
                      const existing = old.find((s) => s.id === id);
                      if (!existing) return [{ id, desc: false }];
                      if (!existing.desc) return old.map((s) => (s.id === id ? { ...s, desc: true } : s));
                      return old.filter((s) => s.id !== id);
                    });
                  };
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "h-10 px-4 text-left align-middle text-xs font-semibold text-muted-foreground",
                        "cursor-pointer select-none",
                        align === "right" && "text-right",
                      )}
                      onClick={handleSort}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}>
                      {header.isPlaceholder ? null : (
                        <span className='inline-flex items-center gap-1'>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp className='size-3.5' />
                          ) : sorted === "desc" ? (
                            <ArrowDown className='size-3.5' />
                          ) : (
                            <ArrowUpDown className='size-3.5 opacity-30' />
                          )}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className='border-b last:border-0 transition-colors hover:bg-muted/40'>
                {row.getAllCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: string } | undefined)?.align;
                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-2.5 align-middle text-sm",
                        align === "right" && "text-right tabular-nums",
                      )}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='border-t border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground'>
        Sorted client-side with <code className='rounded bg-muted px-1 py-0.5 font-mono'>@tanstack/react-table</code> ·{" "}
        {daily.length} rows · click headers to sort
      </div>
    </div>
  );
};
