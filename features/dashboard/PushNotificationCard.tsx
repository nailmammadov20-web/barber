"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushSubscription } from "@/features/dashboard/usePushSubscription";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function PushNotificationCard() {
  const { status, isBusy, enable, disable } = usePushSubscription();
  const { push: t } = useDictionary().dashboard;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing className="size-4 text-primary" />
          {t.cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {status === "unsupported" ? (
          <p className="text-sm text-muted-foreground">{t.unsupported}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {status === "subscribed" ? t.subscribedHint : t.unsubscribedHint}
            </p>
            {status === "subscribed" ? (
              <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={disable}>
                <BellOff className="size-4" />
                {t.disable}
              </Button>
            ) : (
              <Button type="button" size="sm" disabled={isBusy || status === "checking"} onClick={enable}>
                <Bell className="size-4" />
                {t.enable}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
