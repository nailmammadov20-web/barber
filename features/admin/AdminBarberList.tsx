"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, MoreVertical, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmActionButton } from "@/features/dashboard/ConfirmActionButton";
import { ResetPasswordButton } from "@/features/admin/ResetPasswordButton";
import { EditBioDialog } from "@/features/admin/EditBioDialog";
import { DeleteBarberButton } from "@/features/admin/DeleteBarberButton";
import { SendInstallReminderButton } from "@/features/admin/SendInstallReminderButton";
import { toggleBarberActive } from "@/app/admin/actions";
import { COUNTRY_LABEL, type BarberCountry } from "@/lib/country";
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
  currency: string;
  country: BarberCountry;
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
type CountryFilterValue = "all" | BarberCountry;

const COUNTRY_FILTERS: { value: CountryFilterValue; label: string }[] = [
  { value: "all", label: "Bütün ölkələr" },
  { value: "AZ", label: COUNTRY_LABEL.AZ },
  { value: "LT", label: COUNTRY_LABEL.LT },
];

function matchesFilter(barber: AdminBarberItem, filter: FilterValue): boolean {
  if (filter === "complete") return barber.isProfileComplete;
  if (filter === "new") return barber.isNew;
  if (filter === "inactive") return barber.isInactive;
  return true;
}

function matchesSearch(barber: AdminBarberItem, query: string): boolean {
  if (!query) return true;
  const haystack = `${barber.fullName} ${barber.email} ${barber.phone} ${barber.city}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function AdminBarberList({ barbers }: { barbers: AdminBarberItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [countryFilter, setCountryFilter] = useState<CountryFilterValue>("all");
  const [search, setSearch] = useState("");

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

  const availableCountries = useMemo(
    () => new Set(barbers.map((barber) => barber.country)),
    [barbers]
  );
  const countryFilterOptions = COUNTRY_FILTERS.filter(
    (option) => option.value === "all" || availableCountries.has(option.value)
  );

  if (barbers.length === 0) {
    return <p className="text-sm text-muted-foreground">Hələ heç bir bərbər qeydiyyatdan keçməyib.</p>;
  }

  const filtered = barbers
    .filter((barber) => matchesFilter(barber, filter))
    .filter((barber) => countryFilter === "all" || barber.country === countryFilter)
    .filter((barber) => matchesSearch(barber, search));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ad, email, telefon və ya şəhərə görə axtar..."
          className="h-10 pl-9"
        />
      </div>

      {countryFilterOptions.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {countryFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCountryFilter(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                countryFilter === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {option.label}
              {option.value !== "all" &&
                ` (${barbers.filter((barber) => barber.country === option.value).length})`}
            </button>
          ))}
        </div>
      )}

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
              <CardContent className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {barber.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{barber.fullName}</p>
                      {barber.country !== "OTHER" && (
                        <Badge variant="outline">{COUNTRY_LABEL[barber.country]}</Badge>
                      )}
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
                      {barber.city} · {barber.bookingsCount} rezervasiya · {barber.revenue} {barber.currency}{" "}
                      qazanc · {barber.createdAtDisplay}
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
                </div>
                <div className="flex shrink-0 items-center gap-2">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Daha çox əməliyyat"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        />
                      }
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className="flex flex-col items-stretch gap-1 [&_button]:w-full [&_button]:justify-start">
                        <EditBioDialog barberId={barber.id} fullName={barber.fullName} bio={barber.bio} />
                        <ResetPasswordButton barberId={barber.id} fullName={barber.fullName} />
                        <SendInstallReminderButton barberId={barber.id} fullName={barber.fullName} />
                        <DropdownMenuSeparator />
                        <DeleteBarberButton barberId={barber.id} fullName={barber.fullName} />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
