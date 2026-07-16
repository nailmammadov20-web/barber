"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Ban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionButton } from "@/features/dashboard/ConfirmActionButton";
import { buildConfirmationMessage, buildWhatsappLink } from "@/lib/whatsapp";
import { confirmBooking, setBookingStatus, deleteManualBlock } from "@/app/dashboard/bookings/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export type BookingCardData = {
  id: string;
  customerName: string;
  customerPhone: string;
  timeSlot: string;
  status: BookingStatus;
  serviceNames: string[];
  durationMinutes: number;
  date?: string;
  isBlock?: boolean;
};

const STATUS_VARIANT: Record<BookingStatus, "secondary" | "default" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
  NO_SHOW: "destructive",
};

export function BookingCard({ booking }: { booking: BookingCardData }) {
  const [isPending, startTransition] = useTransition();
  const { bookingStatus, bookingCard: t } = useDictionary().dashboard;

  const STATUS_LABEL: Record<BookingStatus, string> = {
    PENDING: bookingStatus.pending,
    CONFIRMED: bookingStatus.confirmed,
    CANCELLED: bookingStatus.cancelled,
    COMPLETED: bookingStatus.completed,
    NO_SHOW: bookingStatus.noShow,
  };

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmBooking(booking.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const message = buildConfirmationMessage({
        customerName: result.booking.customerName,
        barberName: result.booking.barberName,
        date: result.booking.date,
        timeSlot: result.booking.timeSlot,
      });
      toast.success(t.confirmedToast);
      window.open(buildWhatsappLink(result.booking.customerPhone, message), "_blank");
    });
  }

  function changeStatus(status: BookingStatus, successMessage: string) {
    startTransition(async () => {
      const result = await setBookingStatus(booking.id, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
    });
  }

  function handleDeleteBlock() {
    startTransition(async () => {
      const result = await deleteManualBlock(booking.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t.blockRemovedToast);
    });
  }

  if (booking.isBlock) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
            <Ban className="size-4 shrink-0" />
            {booking.timeSlot} — {booking.customerName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {booking.durationMinutes} {t.minutesAbbr}
            {booking.date && <> · {booking.date}</>}
          </p>
          <ConfirmActionButton
            label={t.blockRelease}
            variant="outline"
            disabled={isPending}
            title={t.blockConfirmTitle}
            description={t.blockConfirmDescTemplate.replace("{time}", booking.timeSlot)}
            confirmLabel={t.yesDelete}
            onConfirm={handleDeleteBlock}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base font-medium">
          {booking.timeSlot} — {booking.customerName}
        </CardTitle>
        <Badge variant={STATUS_VARIANT[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {booking.serviceNames.join(", ")} ({booking.durationMinutes} {t.minutesAbbr}) ·{" "}
          {booking.customerPhone}
          {booking.date && <> · {booking.date}</>}
        </p>

        {booking.status === "PENDING" && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleConfirm} disabled={isPending}>
              {t.accept}
            </Button>
            <ConfirmActionButton
              label={t.cancel}
              variant="outline"
              disabled={isPending}
              title={t.cancelConfirmTitle}
              description={t.cancelConfirmDescTemplate
                .replace("{name}", booking.customerName)
                .replace("{time}", booking.timeSlot)}
              confirmLabel={t.yesCancel}
              onConfirm={() => changeStatus("CANCELLED", t.cancelledToast)}
            />
          </div>
        )}

        {booking.status === "CONFIRMED" && (
          <div className="flex flex-wrap gap-2">
            <ConfirmActionButton
              label={t.markCompleted}
              disabled={isPending}
              title={t.completeConfirmTitle}
              description={t.completeConfirmDescTemplate
                .replace("{name}", booking.customerName)
                .replace("{time}", booking.timeSlot)}
              confirmLabel={t.yesComplete}
              onConfirm={() => changeStatus("COMPLETED", t.completedToast)}
            />
            <ConfirmActionButton
              label={t.markNoShow}
              variant="outline"
              disabled={isPending}
              title={t.noShowConfirmTitle}
              description={t.noShowConfirmDescTemplate
                .replace("{name}", booking.customerName)
                .replace("{time}", booking.timeSlot)}
              confirmLabel={t.yesNoShow}
              onConfirm={() => changeStatus("NO_SHOW", t.noShowToast)}
            />
            <ConfirmActionButton
              label={t.cancel}
              variant="outline"
              disabled={isPending}
              title={t.cancelConfirmTitle}
              description={t.cancelConfirmDescTemplate
                .replace("{name}", booking.customerName)
                .replace("{time}", booking.timeSlot)}
              confirmLabel={t.yesCancel}
              onConfirm={() => changeStatus("CANCELLED", t.cancelledToast)}
            />
          </div>
        )}

        {(booking.status === "CANCELLED" || booking.status === "COMPLETED" || booking.status === "NO_SHOW") && (
          <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
            <p className="text-xs text-muted-foreground">{t.revertHint}</p>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() =>
                changeStatus(booking.status === "CANCELLED" ? "PENDING" : "CONFIRMED", t.revertedToast)
              }
            >
              {t.revert}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
