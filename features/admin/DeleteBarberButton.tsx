"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteBarber } from "@/app/admin/actions";

export function DeleteBarberButton({ barberId, fullName }: { barberId: string; fullName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const canDelete = confirmText.trim() === fullName.trim();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBarber(barberId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${fullName} həmişəlik silindi.`);
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setConfirmText("");
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" size="sm" variant="destructive">
            <Trash2 className="size-4" />
            Sil
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fullName} həmişəlik silinsin?</DialogTitle>
          <DialogDescription>
            Bu geri qaytarıla bilməz — hesab, bütün xidmətlər, iş saatları, rezervasiya tarixçəsi və ictimai
            səhifə tamamilə silinəcək. Sadəcə profili gizlətmək istəyirsinizsə, əvəzinə &ldquo;Deaktiv
            et&rdquo;dən istifadə edin.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Təsdiq üçün bərbərin adını yazın: <span className="font-semibold">{fullName}</span>
          </p>
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={fullName}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" disabled={!canDelete || isPending} onClick={handleDelete}>
            {isPending ? "Silinir..." : "Həmişəlik sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
