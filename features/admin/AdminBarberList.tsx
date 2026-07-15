"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmActionButton } from "@/features/dashboard/ConfirmActionButton";
import { ResetPasswordButton } from "@/features/admin/ResetPasswordButton";
import { EditBioDialog } from "@/features/admin/EditBioDialog";
import { DeleteBarberButton } from "@/features/admin/DeleteBarberButton";
import { toggleBarberActive } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

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
  bio: string;
  createdAtDisplay: string;
  isOnline: boolean;
  isNew: boolean;
  isInactive: boolean;
  isProfileComplete: boolean;
  lastActiveDisplay: string;
};

const FILTERS = [
  { value: "all", label: "Hamısı" },
  { value: "complete", label: "Tam profil" },
  { value: "new", label: "Yeni qoşulanlar" },
  { value: "inactive", label: "Uzun müddət aktiv olmayan" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

function matchesFilter(barber: AdminBarberItem, filter: FilterValue): boolean {
  if (filter === "complete") return barber.isProfileComplete;
  if (filter === "new") return barber.isNew;
  if (filter === "inactive") return barber.isInactive;
  return true;
}

export function AdminBarberList({ barbers }: { barbers: AdminBarberItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterValue>("all");

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

  const filtered = barbers.filter((barber) => matchesFilter(barber, filter));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {option.label}
            {option.value !== "all" &&
              ` (${barbers.filter((barber) => matchesFilter(barber, option.value)).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bu filtrə uyğun bərbər tapılmadı.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((barber) => (
            <Card key={barber.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{barber.fullName}</p>
                    <Badge variant={barber.active ? "default" : "outline"}>
                      {barber.active ? "Aktiv" : "Deaktiv"}
                    </Badge>
                    {barber.isNew && <Badge variant="secondary">Yeni</Badge>}
                    {!barber.isProfileComplete && <Badge variant="outline">Profil natamam</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {barber.email} · {barber.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {barber.city} · {barber.bookingsCount} rezervasiya · {barber.revenue} AZN qazanc ·{" "}
                    {barber.createdAtDisplay}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        barber.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                      )}
                    />
                    {barber.isOnline ? (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Onlayn</span>
                    ) : (
                      <span className="text-muted-foreground">Son aktiv: {barber.lastActiveDisplay}</span>
                    )}
                  </div>
                  <Link
                    href={`/barber/${barber.slug}`}
                    target="_blank"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4"
                  >
                    /barber/{barber.slug}
                    <ExternalLink className="size-3" />
                  </Link>
                  {barber.bio && (
                    <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground italic">
                      &ldquo;{barber.bio}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
                  <EditBioDialog barberId={barber.id} fullName={barber.fullName} bio={barber.bio} />
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
                  <DeleteBarberButton barberId={barber.id} fullName={barber.fullName} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
