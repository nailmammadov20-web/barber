"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PERIODS = [
  { label: "Səhər", from: 0, to: 12 },
  { label: "Günorta", from: 12, to: 17 },
  { label: "Axşam", from: 17, to: 24 },
];

function hourOf(slot: string): number {
  return Number(slot.slice(0, 2));
}

export function SlotPicker({
  slots,
  value,
  onChange,
  loading,
}: {
  slots: string[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
        Bu tarixdə boş saat yoxdur.
      </p>
    );
  }

  const groups = PERIODS.map((period) => ({
    ...period,
    slots: slots.filter((slot) => hourOf(slot) >= period.from && hourOf(slot) < period.to),
  })).filter((group) => group.slots.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.label}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {group.slots.map((slot) => {
              const isSelected = value === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onChange(slot)}
                  className={cn(
                    "relative flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  {isSelected && <Check className="absolute left-2 size-3.5" />}
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
