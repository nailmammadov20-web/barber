"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "barberhub-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const iosCheckTimer = setTimeout(() => {
      if (isIos()) setShowIosHint(true);
    }, 0);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(iosCheckTimer);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDeferredPrompt(null);
    setShowIosHint(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, "1");
    }
    setDeferredPrompt(null);
  }

  if (!deferredPrompt && !showIosHint) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-card-foreground shadow-lg ring-1 ring-foreground/10">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Download className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">BarberHub-u telefonunuza yükləyin</p>
        <p className="text-xs text-muted-foreground">
          {deferredPrompt
            ? "Ana ekrana əlavə edin, tətbiq kimi işlədin."
            : "Paylaş düyməsi → “Ana ekrana əlavə et”"}
        </p>
      </div>
      {deferredPrompt && (
        <Button size="sm" className="rounded-lg" onClick={handleInstall}>
          Yüklə
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="size-8 shrink-0 rounded-full"
        aria-label="Bağla"
        onClick={dismiss}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
