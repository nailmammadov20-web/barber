"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushSubscription } from "@/features/dashboard/usePushSubscription";

export function PushNotificationCard() {
  const { status, isBusy, enable, disable } = usePushSubscription();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing className="size-4 text-primary" />
          Bildirişlər
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {status === "unsupported" ? (
          <p className="text-sm text-muted-foreground">
            Bu cihaz/brauzer bildirişləri dəstəkləmir. iPhone-da bildirişlər üçün tətbiqi əvvəlcə
            ana ekrana əlavə edin.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {status === "subscribed"
                ? "Yeni rezervasiya olanda bu cihaza bildiriş gələcək."
                : "Kimsə rezervasiya edəndə dərhal xəbərdar olun."}
            </p>
            {status === "subscribed" ? (
              <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={disable}>
                <BellOff className="size-4" />
                Deaktiv et
              </Button>
            ) : (
              <Button type="button" size="sm" disabled={isBusy || status === "checking"} onClick={enable}>
                <Bell className="size-4" />
                Bildirişləri aktivləşdir
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
