"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resetBarberPassword } from "@/app/admin/actions";

export function ResetPasswordButton({ barberId, fullName }: { barberId: string; fullName: string }) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await resetBarberPassword(barberId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setNewPassword(result.newPassword);
    });
  }

  async function handleCopy() {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      toast.success("Parol kopyalandı.");
    } catch {
      toast.error("Kopyalanmadı, brauzeriniz buna icazə vermir.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setNewPassword(null);
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <KeyRound className="size-4" />
            Parolu sıfırla
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fullName} üçün parolu sıfırla</DialogTitle>
          <DialogDescription>
            {newPassword
              ? "Yeni parol yaradıldı. Bu, yalnız bir dəfə göstərilir — kopyalayıb bərbərə ötürün."
              : "Yeni təsadüfi parol yaradılacaq və bərbərin mövcud sessiyaları sona çatacaq (yenidən daxil olmalı olacaq)."}
          </DialogDescription>
        </DialogHeader>

        {newPassword ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
            <code className="flex-1 font-mono text-sm break-all">{newPassword}</code>
            <Button type="button" size="icon-sm" variant="ghost" onClick={handleCopy} aria-label="Kopyala">
              <Copy className="size-4" />
            </Button>
          </div>
        ) : (
          <DialogFooter>
            <Button type="button" onClick={handleGenerate} disabled={isPending}>
              {isPending ? "Yaradılır..." : "Yeni parol yarat"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
