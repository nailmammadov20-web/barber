"use client";

import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushSubscription } from "@/features/dashboard/usePushSubscription";

export function NotificationRequiredBanner() {
  const { status, isBusy, enable } = usePushSubscription();

  if (status !== "unsubscribed") return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <BellRing className="size-5 shrink-0 text-primary" />
      <p className="min-w-0 flex-1 text-sm">
        Yeni rezervasiyaları qaçırmamaq üçün bildirişləri aktivləşdirin.
      </p>
      <Button type="button" size="sm" className="rounded-lg" disabled={isBusy} onClick={enable}>
        Aktivləşdir
      </Button>
    </div>
  );
}
