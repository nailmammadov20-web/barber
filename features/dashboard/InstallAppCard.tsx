"use client";

import { Download, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/pwa/useInstallPrompt";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function InstallAppCard() {
  const { canPromptInstall, isStandalone, isIos, promptInstall } = useInstallPrompt();
  const { installApp: t } = useDictionary().dashboard;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Smartphone className="size-4 text-primary" />
          {t.cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {isStandalone ? (
          <p className="text-sm text-muted-foreground">{t.alreadyInstalled}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {isIos ? t.iosHint : canPromptInstall ? t.description : t.fallbackHint}
            </p>
            {canPromptInstall && (
              <Button size="sm" className="rounded-lg" onClick={promptInstall}>
                <Download className="size-4" />
                {t.installButton}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
