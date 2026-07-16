"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/pwa/useInstallPrompt";

const DISMISSED_KEY = "barberhub-install-dismissed";

export function InstallPrompt() {
  const { canPromptInstall, isStandalone, isIos, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDismissed(!!localStorage.getItem(DISMISSED_KEY));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, "1");
      setDismissed(true);
    }
  }

  if (isStandalone || dismissed || (!canPromptInstall && !isIos)) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-card-foreground shadow-lg ring-1 ring-foreground/10">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Download className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">BarberHub-u telefonunuza yükləyin</p>
        <p className="text-xs text-muted-foreground">
          {canPromptInstall
            ? "Ana ekrana əlavə edin, tətbiq kimi işlədin."
            : "Paylaş düyməsi → “Ana ekrana əlavə et”"}
        </p>
      </div>
      {canPromptInstall && (
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
