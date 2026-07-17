"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminPushSubscription } from "@/features/admin/useAdminPushSubscription";

export function AdminPushToggle() {
  const { status, isBusy, enable, disable } = useAdminPushSubscription();

  if (status === "checking" || status === "unsupported") return null;

  if (status === "subscribed") {
    return (
      <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={disable} className="gap-1.5">
        <Bell className="size-4" />
        Bildirişlər aktiv
      </Button>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={enable} className="gap-1.5">
      <BellOff className="size-4" />
      Bildirişləri aktivləşdir
    </Button>
  );
}
