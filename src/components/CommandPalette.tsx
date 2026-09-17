import { lazy, Suspense, useEffect, useState } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";

// On-demand only: dialog UI + Fuse.js + item registry stay out of the entry
// until first open. The dedicated Suspense boundary keeps the lazy chunk from
// ever suspending the root (which would block hydration).
const CommandPaletteDialog = lazy(() =>
  import("./CommandPaletteDialog").then((m) => ({ default: m.CommandPaletteDialog })),
);

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  // 1. TanStack Hotkeys registrations (eager — tiny, must work pre-open)
  useHotkey("Mod+K", (event) => {
    event.preventDefault();
    setOpen((prev) => !prev);
  });

  useHotkey(
    "/",
    (event) => {
      event.preventDefault();
      setOpen(true);
    },
    { enabled: !open },
  );

  useHotkey(
    "Escape",
    (event) => {
      event.preventDefault();
      setOpen(false);
    },
    { enabled: open },
  );

  // 2. Custom global event listener for navbar search button.
  // Registered eagerly so clicks never race the lazy chunk load.
  useEffect(() => {
    const onExternalOpen = () => setOpen(true);
    globalThis.addEventListener("open-command-palette", onExternalOpen);
    return () => {
      globalThis.removeEventListener("open-command-palette", onExternalOpen);
    };
  }, []);

  return (
    <Suspense fallback={null}>{open ? <CommandPaletteDialog open={open} onOpenChange={setOpen} /> : null}</Suspense>
  );
}
