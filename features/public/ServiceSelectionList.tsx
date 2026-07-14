"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
            placeholder="Xidmət axtar..."
            className="h-9 pl-9"
          />
        </div>
      )}

      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Uyğun xidmət tapılmadı.</p>
        ) : (
          filtered.map((service) => {
            const checked = value.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggle(service.id)}
                aria-pressed={checked}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                  )}
                >
                  {checked && <Check className="size-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.durationMinutes} dəqiqə</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {service.price} AZN
                </span>
              </button>
            );
          })
        )}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} xidmət seçilib · Ümumi: {totalDuration} dəqiqə · {totalPrice} AZN
        </p>
      )}
    </div>
  );
}
