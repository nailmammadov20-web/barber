"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveWorkingHours } from "@/app/dashboard/hours/actions";
import type { WorkingHourEntry } from "@/lib/validation/workingHours";

const WEEKDAY_LABELS = [
  "Bazar",
  "Bazar ertəsi",
  "Çərşənbə axşamı",
  "Çərşənbə",
  "Cümə axşamı",
  "Cümə",
  "Şənbə",
];

export function WorkingHoursForm({ initialHours }: { initialHours: WorkingHourEntry[] }) {
  const [hours, setHours] = useState(initialHours);
  const [isSubmitting, startTransition] = useTransition();

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
      toast.success("İş saatları yadda saxlanıldı.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {hours.map((entry) => (
        <div key={entry.weekday} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <span className="w-36 text-sm font-medium">{WEEKDAY_LABELS[entry.weekday]}</span>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={entry.isOff}
              onChange={(event) => updateEntry(entry.weekday, { isOff: event.target.checked })}
            />
            Bağlı
          </label>
          {!entry.isOff && (
            <>
              <Input
                type="time"
                value={entry.startTime}
                onChange={(event) => updateEntry(entry.weekday, { startTime: event.target.value })}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">—</span>
              <Input
                type="time"
                value={entry.endTime}
                onChange={(event) => updateEntry(entry.weekday, { endTime: event.target.value })}
                className="w-32"
              />
            </>
          )}
        </div>
      ))}
      <Button onClick={handleSave} disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Yadda saxlanılır..." : "Yadda saxla"}
      </Button>
    </div>
  );
}
