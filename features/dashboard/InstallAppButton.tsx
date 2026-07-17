"use client";

import { Download, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/pwa/useInstallPrompt";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function InstallAppButton() {
  const { canPromptInstall, isStandalone, isIos, promptInstall } = useInstallPrompt();
  const { installApp: t } = useDictionary().dashboard;

  if (isStandalone) return null;

  async function handleClick() {
    if (canPromptInstall) {
      await promptInstall();
      return;
    }
    toast.info(isIos ? t.iosHint : t.fallbackHint);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <Smartphone className="size-5 shrink-0 text-primary" />
      <p className="min-w-0 flex-1 text-sm">{t.description}</p>
      <Button type="button" size="sm" className="rounded-lg" onClick={handleClick}>
        <Download className="size-4" />
        {t.installButton}
      </Button>
    </div>
  );
}
