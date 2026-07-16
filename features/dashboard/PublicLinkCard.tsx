"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareStatusButton } from "@/features/shared/ShareStatusButton";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function PublicLinkCard({
  slug,
  fullName,
  photoUrl,
  city,
  bio,
}: {
  slug: string;
  fullName: string;
  photoUrl: string | null;
  city: string;
  bio: string | null;
}) {
  const [isCopying, startTransition] = useTransition();
  const path = `/barber/${slug}`;
  const { publicLink: t } = useDictionary().dashboard;

  function handleCopy() {
    startTransition(async () => {
      try {
        const url = `${window.location.origin}${path}`;
        await navigator.clipboard.writeText(url);
        toast.success(t.copiedToast);
      } catch {
        toast.error(t.copyFailedToast);
      }
    });
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">{t.title}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">barberhub.az{path}</p>
        </div>
        <div className="flex flex-wrap shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy} disabled={isCopying}>
            <Copy className="size-4" />
            {t.copy}
          </Button>
          <ShareStatusButton fullName={fullName} photoUrl={photoUrl} city={city} path={path} bio={bio} />
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href={path} target="_blank">
                {t.view}
                <ExternalLink className="size-4" />
              </Link>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
