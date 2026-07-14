"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDateDisplay, formatDateInput } from "@/lib/formatDate";
import { todayInBaku } from "@/lib/timezone";

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

export function BookingsFilterBar({ date, status }: { date: string; status: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [dateOpen, setDateOpen] = useState(false);

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
          <Button
            type="button"
            variant="outline"
            onClick={() => setDateOpen(true)}
            className="h-10 flex-1 justify-start gap-2 rounded-lg font-normal sm:flex-none"
          >
            <CalendarDays className="size-4 text-muted-foreground" />
            {formatDateDisplay(date)}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => updateParams({ date: shiftDate(date, 1) })}
            aria-label="Sonrakı gün"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => updateParams({ date: todayInBaku() })}>
            Bugün
          </Button>
        </div>
      )}

      {/*
        Modal Dialog (bottom sheet on mobile, centered card on sm+) instead of a native
        <input type="date"> — matches the picker used on the public booking page and
        avoids inconsistent, hard-to-style native date UI across mobile browsers.
      */}
      <Dialog open={dateOpen} onOpenChange={setDateOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>Tarix seçin</DialogTitle>
          <DialogDescription>Baxmaq istədiyiniz tarixi seçin.</DialogDescription>
        </DialogHeader>
        <DialogContent
          showCloseButton={false}
          className="inset-x-0 bottom-0 top-auto left-0 w-full max-w-full translate-x-0 translate-y-0 gap-0 rounded-t-2xl rounded-b-none p-0 sm:inset-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-auto sm:max-w-none sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium">Tarix seçin</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDateOpen(false)}
              aria-label="Bağla"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div
            className="flex justify-center px-2 pt-2"
            style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
          >
            <Calendar
              mode="single"
              selected={new Date(`${date}T00:00:00`)}
              onSelect={(day) => {
                if (!day) return;
                updateParams({ date: formatDateInput(day) });
                setDateOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
