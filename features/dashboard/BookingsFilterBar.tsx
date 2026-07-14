"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Hamısı" },
  { value: "PENDING", label: "Gözləyir" },
  { value: "CONFIRMED", label: "Təsdiqlənib" },
  { value: "COMPLETED", label: "Tamamlanıb" },
  { value: "CANCELLED", label: "Ləğv edilib" },
  { value: "NO_SHOW", label: "Gəlmədi" },
];

function shiftDate(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function BookingsFilterBar({ date, status }: { date: string; status: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/dashboard/bookings?${params.toString()}`);
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateParams({ q: search.trim() });
  }

  const isSearching = Boolean(searchParams.get("q"));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Müştəri adı və ya telefonu ilə axtar"
            className="h-10 pl-9"
          />
        </div>
        {isSearching && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setSearch("");
              updateParams({ q: "" });
            }}
            aria-label="Axtarışı təmizlə"
          >
            <X className="size-4" />
          </Button>
        )}
        <Button type="submit">Axtar</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateParams({ status: option.value === "all" ? "" : option.value })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              status === option.value || (status === "" && option.value === "all")
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!isSearching && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => updateParams({ date: shiftDate(date, -1) })}
            aria-label="Əvvəlki gün"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(event) => updateParams({ date: event.target.value })}
            className="h-10 w-44"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => updateParams({ date: shiftDate(date, 1) })}
            aria-label="Sonrakı gün"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => updateParams({ date: todayString() })}>
            Bugün
          </Button>
        </div>
      )}
    </div>
  );
}
