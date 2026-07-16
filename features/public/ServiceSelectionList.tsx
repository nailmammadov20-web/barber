"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export type PublicService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

const SEARCH_THRESHOLD = 6;

export function ServiceSelectionList({
  services,
  value,
  onChange,
}: {
  services: PublicService[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const { common, booking } = useDictionary();

  const filtered = query.trim()
    ? services.filter((service) => service.name.toLowerCase().includes(query.trim().toLowerCase()))
    : services;

  const selected = services.filter((service) => value.includes(service.id));
  const totalDuration = selected.reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalPrice = selected.reduce((sum, service) => sum + service.price, 0);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {services.length > SEARCH_THRESHOLD && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={booking.searchPlaceholder}
            className="h-9 pl-9"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{booking.noMatch}</p>
      ) : (
        // Fixed 2-column grid (not flex-wrap) so every cell has the same width —
        // toggling a selection never changes that item's size, so nothing else in
        // the grid shifts position. A wrap-based chip layout looked different but
        // reflowed everything after the tapped item whenever a checkmark/state
        // change altered its width, which felt broken on mobile.
        <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto py-0.5 sm:max-h-72">
          {filtered.map((service) => {
            const checked = value.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggle(service.id)}
                aria-pressed={checked}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:border-primary/50 hover:bg-muted"
                )}
              >
                <span className="text-sm leading-tight font-medium">{service.name}</span>
                <span className={cn("text-xs", checked ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {service.price} {common.currency}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} {booking.selectedSuffix} · {booking.totalLabel} {totalDuration}{" "}
          {booking.minutesUnit} · {totalPrice} {common.currency}
        </p>
      )}
    </div>
  );
}
