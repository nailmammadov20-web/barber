"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmActionButton } from "@/features/dashboard/ConfirmActionButton";
import { ResetPasswordButton } from "@/features/admin/ResetPasswordButton";
import { toggleBarberActive } from "@/app/admin/actions";

export type AdminBarberItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  slug: string;
  active: boolean;
  bookingsCount: number;
  revenue: number;
  createdAtDisplay: string;
};

export function AdminBarberList({ barbers }: { barbers: AdminBarberItem[] }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(barber: AdminBarberItem) {
    startTransition(async () => {
      const result = await toggleBarberActive(barber.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        barber.active ? `${barber.fullName} deaktiv edildi.` : `${barber.fullName} aktiv edildi.`
      );
    });
  }

  if (barbers.length === 0) {
    return <p className="text-sm text-muted-foreground">Hələ heç bir bərbər qeydiyyatdan keçməyib.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {barbers.map((barber) => (
        <Card key={barber.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium">{barber.fullName}</p>
                <Badge variant={barber.active ? "default" : "outline"}>
                  {barber.active ? "Aktiv" : "Deaktiv"}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {barber.email} · {barber.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {barber.city} · {barber.bookingsCount} rezervasiya · {barber.revenue} AZN qazanc ·{" "}
                {barber.createdAtDisplay}
              </p>
              <Link
                href={`/barber/${barber.slug}`}
                target="_blank"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4"
              >
                /barber/{barber.slug}
                <ExternalLink className="size-3" />
              </Link>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ResetPasswordButton barberId={barber.id} fullName={barber.fullName} />
              <ConfirmActionButton
                label={barber.active ? "Deaktiv et" : "Aktiv et"}
                variant={barber.active ? "destructive" : "default"}
                disabled={isPending}
                title={barber.active ? "Bərbəri deaktiv edirsiniz?" : "Bərbəri aktiv edirsiniz?"}
                description={
                  barber.active
                    ? `"${barber.fullName}" ictimai səhifəsi dərhal əlçatmaz olacaq (404). Rezervasiya qəbul edə bilməyəcək.`
                    : `"${barber.fullName}" ictimai səhifəsi yenidən əlçatan olacaq və rezervasiya qəbul edə biləcək.`
                }
                confirmLabel="Bəli"
                onConfirm={() => handleToggle(barber)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
