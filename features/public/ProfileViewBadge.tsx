"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { pingProfileView } from "@/app/barber/[slug]/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";

const PING_INTERVAL_MS = 20_000;

function formatCount(value: number): string {
  const digits = String(value);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    const posFromEnd = digits.length - i;
    if (i > 0 && posFromEnd % 3 === 0) result += " ";
    result += digits[i];
  }
  return result;
}

export function ProfileViewBadge({
  barberId,
  initialTotalViews,
  initialCurrentlyViewing,
}: {
  barberId: string;
  initialTotalViews: number;
  initialCurrentlyViewing: number;
}) {
  const [totalViews, setTotalViews] = useState(initialTotalViews);
  const [currentlyViewing, setCurrentlyViewing] = useState(initialCurrentlyViewing);
  const { booking } = useDictionary();

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const stats = await pingProfileView(barberId);
      if (cancelled) return;
      setTotalViews(stats.totalViews);
      setCurrentlyViewing(stats.currentlyViewing);
    }

    ping();
    const interval = setInterval(ping, PING_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [barberId]);

  return (
    <span className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground lg:justify-start">
      <Eye className="size-3.5 shrink-0" />
      {formatCount(totalViews)} {booking.viewsSuffix}
      {currentlyViewing > 0 && (
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="text-muted-foreground/60">·</span>
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          {formatCount(currentlyViewing)} {booking.viewingNowSuffix}
        </span>
      )}
    </span>
  );
}
