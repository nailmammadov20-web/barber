"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareStatusButton } from "@/features/shared/ShareStatusButton";
import { useDictionary } from "@/lib/i18n/I18nProvider";

const SHOWN_KEY_PREFIX = "barberhub-status-promo-";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_PER_WEEK = 2;
const OPEN_DELAY_MS = 1500;

export function StatusPromoModal({
  barberId,
  isNew,
  fullName,
  photoUrl,
  city,
  bio,
  path,
}: {
  barberId: string;
  isNew: boolean;
  fullName: string;
  photoUrl: string | null;
  city: string;
  bio: string | null;
  path: string;
}) {
  const [open, setOpen] = useState(false);
  const { statusPromo: t } = useDictionary().dashboard;

  useEffect(() => {
    if (!isNew) return;

    const storageKey = `${SHOWN_KEY_PREFIX}${barberId}`;
    const timer = setTimeout(() => {
      const now = Date.now();
      const raw = localStorage.getItem(storageKey);
      const shownAt: number[] = raw ? JSON.parse(raw) : [];
      const recent = shownAt.filter((timestamp) => now - timestamp < WEEK_MS);

      if (recent.length >= MAX_PER_WEEK) return;

      recent.push(now);
      localStorage.setItem(storageKey, JSON.stringify(recent.slice(-10)));
      setOpen(true);
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [barberId, isNew]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            {t.later}
          </Button>
          <ShareStatusButton
            fullName={fullName}
            photoUrl={photoUrl}
            city={city}
            path={path}
            bio={bio}
            label={t.shareNow}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
