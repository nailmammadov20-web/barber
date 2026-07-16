"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/I18nProvider";

const LABELS = { az: "AZ", lt: "LT" } as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleLocale() {
    const next = locale === "az" ? "lt" : "az";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Dil dəyiş / Keisti kalbą"
      onClick={toggleLocale}
      disabled={isPending}
      className="fixed top-4 right-16 z-50 rounded-full bg-background/80 text-xs font-semibold backdrop-blur-sm"
    >
      {LABELS[locale === "az" ? "lt" : "az"]}
    </Button>
  );
}
