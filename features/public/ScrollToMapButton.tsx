"use client";

import { Map } from "lucide-react";

export function ScrollToMapButton({ targetId }: { targetId: string }) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
      aria-label="Xəritəyə keç"
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <Map className="size-3" />
    </button>
  );
}
