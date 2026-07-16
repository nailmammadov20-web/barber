"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { saveWorkingHours } from "@/app/dashboard/hours/actions";
import type { WorkingHourEntry } from "@/lib/validation/workingHours";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function WorkingHoursForm({ initialHours }: { initialHours: WorkingHourEntry[] }) {
  const [hours, setHours] = useState(initialHours);
  const [isSubmitting, startTransition] = useTransition();
  const { hours: t } = useDictionary().dashboard;

  function updateEntry(weekday: number, patch: Partial<WorkingHourEntry>) {
    setHours((prev) => prev.map((entry) => (entry.weekday === weekday ? { ...entry, ...patch } : entry)));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveWorkingHours(hours);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t.savedToast);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {hours.map((entry) => (
        <div key={entry.weekday} className="flex flex-col gap-3 rounded-xl border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{t.weekdays[entry.weekday]}</span>
            <button
              type="button"
              onClick={() => updateEntry(entry.weekday, { isOff: !entry.isOff })}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                entry.isOff
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/15 text-primary"
              )}
            >
              {entry.isOff ? t.closed : t.open}
            </button>
          </div>
          {!entry.isOff && (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={entry.startTime}
                onChange={(event) => updateEntry(entry.weekday, { startTime: event.target.value })}
                className="h-10 flex-1 rounded-lg"
              />
              <span className="shrink-0 text-sm text-muted-foreground">—</span>
              <Input
                type="time"
                value={entry.endTime}
                onChange={(event) => updateEntry(entry.weekday, { endTime: event.target.value })}
                className="h-10 flex-1 rounded-lg"
              />
            </div>
          )}
        </div>
      ))}
      <Button onClick={handleSave} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-lg sm:w-fit">
        {isSubmitting ? t.saving : t.save}
      </Button>
    </div>
  );
}
