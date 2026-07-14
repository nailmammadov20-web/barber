"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateBarberBio } from "@/app/admin/actions";

const MAX_LENGTH = 500;

export function EditBioDialog({ barberId, fullName, bio }: { barberId: string; fullName: string; bio: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(bio);
  const [isSubmitting, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateBarberBio(barberId, value);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Haqqında mətni yeniləndi.");
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setValue(bio);
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Pencil className="size-4" />
            Haqqında
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {fullName} — &ldquo;Haqqında&rdquo; mətni
          </DialogTitle>
          <DialogDescription>
            Bərbərin ictimai profilində göstərilən özü haqqında yazdığı mətn. Admin olaraq redaktə
            edə bilərsiniz.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={5}
          maxLength={MAX_LENGTH}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Bərbər özü haqqında heç nə yazmayıb."
          className="resize-none rounded-lg"
        />
        <p className="text-right text-xs text-muted-foreground">
          {value.length}/{MAX_LENGTH}
        </p>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Yadda saxlanılır..." : "Yadda saxla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
