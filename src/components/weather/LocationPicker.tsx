import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, Search, MapPin } from "lucide-react";

import { VIRTUAL_PICKER } from "@/lib/virtualization";
import type { WeatherLocation } from "@/data/locations";

interface LocationPickerProps {
  locations: WeatherLocation[];
  value: WeatherLocation | null;
  onValueChange: (location: WeatherLocation) => void;
}

function VirtualizedContent() {
  const filteredItems = Combobox.useFilteredItems<WeatherLocation>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => VIRTUAL_PICKER.OPTION_HEIGHT,
    overscan: VIRTUAL_PICKER.OVERSCAN,
    getItemKey: (index) => index,
  });

  const totalSize = `${virtualizer.getTotalSize()}px`;

  return (
    <>
      <Combobox.List className='p-1'>
        {filteredItems.length > 0 ? (
          <div ref={scrollRef} className='h-64 overflow-auto overscroll-contain'>
            <div className='relative w-full' style={{ height: totalSize }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const option = filteredItems[virtualRow.index];
                if (!option) return null;
                return (
                  <Combobox.Item
                    key={virtualRow.key}
                    index={virtualRow.index}
                    value={option}
                    className='absolute top-0 left-0 flex w-full cursor-default items-center rounded-sm px-2 py-0 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground'
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    aria-setsize={filteredItems.length}
                    aria-posinset={virtualRow.index + 1}>
                    <span className='absolute left-2 flex size-3.5 items-center justify-center'>
                      <Combobox.ItemIndicator>
                        <Check className='size-4' />
                      </Combobox.ItemIndicator>
                    </span>
                    <span className='ml-6 flex min-w-0 flex-1 items-center justify-between gap-2'>
                      <span className='truncate font-medium'>{option.label}</span>
                      <span className='truncate text-xs text-muted-foreground'>{option.country}</span>
                    </span>
                  </Combobox.Item>
                );
              })}
            </div>
          </div>
        ) : null}
      </Combobox.List>

      <div className='border-t border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground'>
        Virtualized with <code className='rounded bg-muted px-1 py-0.5 font-mono'>@tanstack/react-virtual</code> ·{" "}
        {filteredItems.length} results
      </div>
    </>
  );
}

export const LocationPicker = ({ locations, value, onValueChange }: LocationPickerProps) => {
  return (
    <Combobox.Root
      items={locations}
      virtualized
      autoHighlight
      value={value}
      onValueChange={(option: WeatherLocation | null) => {
        if (option) onValueChange(option);
      }}
      itemToStringLabel={(option: WeatherLocation | null) => (option ? `${option.label}, ${option.country}` : "")}>
      <Combobox.Trigger
        aria-label='Select location'
        className='flex h-10 w-full max-w-md items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
        <span className='flex items-center gap-2 truncate'>
          <MapPin className='size-4 shrink-0 text-muted-foreground' />
          <Combobox.Value placeholder='Select a location'>
            {(selected: WeatherLocation | null) =>
              selected ? (
                <span className='truncate'>
                  {selected.label} <span className='text-muted-foreground'>· {selected.country}</span>
                </span>
              ) : (
                "Select a location"
              )
            }
          </Combobox.Value>
        </span>
        <ChevronDown className='size-4 shrink-0 opacity-50' />
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className='z-50'>
          <Combobox.Popup className='w-(--anchor-width) overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md'>
            <div className='flex items-center gap-2 border-b border-border px-3'>
              <Search className='size-4 shrink-0 text-muted-foreground' />
              <Combobox.Input
                placeholder='Search 20 locations…'
                className='h-9 w-full border-none bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground'
                aria-label='Search locations'
              />
            </div>

            <Combobox.Empty className='p-4 text-center text-sm text-muted-foreground'>
              No locations found.
            </Combobox.Empty>

            <VirtualizedContent />
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
};
