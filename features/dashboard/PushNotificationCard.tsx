"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscribeToPush, unsubscribeFromPush } from "@/app/dashboard/actions";

type Status = "checking" | "unsupported" | "subscribed" | "unsubscribed";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function PushNotificationCard() {
  const [status, setStatus] = useState<Status>("checking");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "subscribed" : "unsubscribed");
    }
    checkStatus().catch(() => setStatus("unsupported"));
  }, []);

  async function handleEnable() {
    setIsBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Bildiriş icazəsi verilmədi.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("missing-vapid-key");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const raw = subscription.toJSON();
      const result = await subscribeToPush({
        endpoint: raw.endpoint!,
        keys: { p256dh: raw.keys!.p256dh, auth: raw.keys!.auth },
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setStatus("subscribed");
      toast.success("Bildirişlər aktivləşdirildi.");
    } catch {
      toast.error("Bildirişlər aktivləşdirilə bilmədi.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDisable() {
    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await unsubscribeFromPush(endpoint);
      }
      setStatus("unsubscribed");
      toast.success("Bildirişlər deaktiv edildi.");
    } catch {
      toast.error("Bildirişlər deaktiv edilə bilmədi.");
    } finally {
      setIsBusy(false);
    }
  }

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
              <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={handleDisable}>
                <BellOff className="size-4" />
                Deaktiv et
              </Button>
            ) : (
              <Button type="button" size="sm" disabled={isBusy || status === "checking"} onClick={handleEnable}>
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
