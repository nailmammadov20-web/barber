"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { subscribeAdminToPush, unsubscribeAdminFromPush } from "@/app/admin/actions";

export type AdminPushStatus = "checking" | "unsupported" | "subscribed" | "unsubscribed";

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

export function useAdminPushSubscription() {
  const [status, setStatus] = useState<AdminPushStatus>("checking");
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

  async function enable() {
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
      const result = await subscribeAdminToPush({
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
      toast.error("Bildirişləri aktivləşdirmək mümkün olmadı.");
    } finally {
      setIsBusy(false);
    }
  }

  async function disable() {
    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await unsubscribeAdminFromPush(endpoint);
      }
      setStatus("unsubscribed");
      toast.success("Bildirişlər deaktiv edildi.");
    } catch {
      toast.error("Bildirişləri deaktiv etmək mümkün olmadı.");
    } finally {
      setIsBusy(false);
    }
  }

  return { status, isBusy, enable, disable };
}
