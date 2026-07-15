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

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Gözləyir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
  NO_SHOW: "Gəlmədi",
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
      toast.success("Rezervasiya təsdiqləndi.");
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
      toast.success("Blok ləğv edildi.");
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
            {booking.durationMinutes} dəq{booking.date && <> · {booking.date}</>}
          </p>
          <ConfirmActionButton
            label="Blokun ləğvi"
            variant="outline"
            disabled={isPending}
            title="Bu vaxtı yenidən açırsınız?"
            description={`${booking.timeSlot} vaxtı üçün bloklama silinəcək, bu saat yenidən rezervasiya üçün əlçatan olacaq.`}
            confirmLabel="Bəli, sil"
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
          {booking.serviceNames.join(", ")} ({booking.durationMinutes} dəq) · {booking.customerPhone}
          {booking.date && <> · {booking.date}</>}
        </p>

        {booking.status === "PENDING" && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleConfirm} disabled={isPending}>
              Qəbul et
            </Button>
            <ConfirmActionButton
              label="Ləğv et"
              variant="outline"
              disabled={isPending}
              title="Rezervasiyanı ləğv edirsiniz?"
              description={`${booking.customerName} — ${booking.timeSlot} rezervasiyası ləğv ediləcək.`}
              confirmLabel="Bəli, ləğv et"
              onConfirm={() => changeStatus("CANCELLED", "Rezervasiya ləğv edildi.")}
            />
          </div>
        )}

        {booking.status === "CONFIRMED" && (
          <div className="flex flex-wrap gap-2">
            <ConfirmActionButton
              label="Tamamlandı"
              disabled={isPending}
              title="Rezervasiyanı tamamlandı olaraq qeyd edirsiniz?"
              description={`${booking.customerName} — ${booking.timeSlot} xidməti tamamlanmış sayılacaq.`}
              confirmLabel="Bəli, tamamlandı"
              onConfirm={() => changeStatus("COMPLETED", "Rezervasiya tamamlandı olaraq qeyd edildi.")}
            />
            <ConfirmActionButton
              label="Gəlmədi"
              variant="outline"
              disabled={isPending}
              title="Müştəri gəlmədi olaraq qeyd edirsiniz?"
              description={`${booking.customerName} — ${booking.timeSlot} rezervasiyasına müştəri gəlməmiş sayılacaq.`}
              confirmLabel="Bəli, gəlmədi"
              onConfirm={() => changeStatus("NO_SHOW", "Müştəri gəlmədi olaraq qeyd edildi.")}
            />
            <ConfirmActionButton
              label="Ləğv et"
              variant="outline"
              disabled={isPending}
              title="Rezervasiyanı ləğv edirsiniz?"
              description={`${booking.customerName} — ${booking.timeSlot} rezervasiyası ləğv ediləcək.`}
              confirmLabel="Bəli, ləğv et"
              onConfirm={() => changeStatus("CANCELLED", "Rezervasiya ləğv edildi.")}
            />
          </div>
        )}

        {(booking.status === "CANCELLED" || booking.status === "COMPLETED" || booking.status === "NO_SHOW") && (
          <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
            <p className="text-xs text-muted-foreground">Səhvən dəyişdiniz? Statusu geri qaytara bilərsiniz.</p>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() =>
                changeStatus(
                  booking.status === "CANCELLED" ? "PENDING" : "CONFIRMED",
                  "Status geri qaytarıldı."
                )
              }
            >
              Geri qaytar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
