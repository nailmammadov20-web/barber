"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlarmClockOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setBookingStatus } from "@/app/dashboard/bookings/actions";
import { nowMinutesInBaku } from "@/lib/timezone";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export type OverdueBooking = {
  id: string;
  customerName: string;
  timeSlot: string;
  serviceNames: string[];
};

function isPast(timeSlot: string): boolean {
  const [hours, minutes] = timeSlot.split(":").map(Number);
  return hours * 60 + minutes < nowMinutesInBaku();
}

export function OverdueBookingsPrompt({ bookings }: { bookings: OverdueBooking[] }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const { overdue: t } = useDictionary().dashboard;

  const overdue = bookings.filter((booking) => isPast(booking.timeSlot));

  if (overdue.length === 0) return null;

  function resolve(booking: OverdueBooking, status: "COMPLETED" | "NO_SHOW") {
    startTransition(async () => {
      const result = await setBookingStatus(booking.id, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        (status === "COMPLETED" ? t.completedToastTemplate : t.noShowToastTemplate).replace(
          "{name}",
          booking.customerName
        )
      );
      router.refresh();
    });
  }

  return (
    <Dialog open={!dismissed} onOpenChange={(next) => setDismissed(!next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlarmClockOff className="size-4 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2.5">
          {overdue.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {booking.timeSlot} — {booking.customerName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {booking.serviceNames.join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={isSubmitting} onClick={() => resolve(booking, "COMPLETED")}>
                  {t.completed}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => resolve(booking, "NO_SHOW")}
                >
                  {t.noShow}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
