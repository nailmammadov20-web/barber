"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendInstallAppReminder } from "@/app/admin/actions";

export function SendInstallReminderButton({ barberId, fullName }: { barberId: string; fullName: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await sendInstallAppReminder(barberId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${fullName} adlı bərbərə tətbiq yükləmə bildirişi göndərildi.`);
    });
  }

  return (
    <Button size="sm" variant="outline" disabled={isPending} onClick={handleClick}>
      <Smartphone className="size-4" />
      {isPending ? "Göndərilir..." : "Yükləmə bildirişi göndər"}
    </Button>
  );
}
