"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Scissors, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmActionButton } from "@/features/dashboard/ConfirmActionButton";
import { SERVICE_TEMPLATES } from "@/lib/serviceTemplates";
import {
  adminAddService,
  adminDeleteService,
  adminToggleService,
  getBarberServices,
} from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type ServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export function ManageServicesDialog({
  barberId,
  fullName,
  currency,
}: {
  barberId: string;
  fullName: string;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [customName, setCustomName] = useState("");
  const [customDuration, setCustomDuration] = useState(30);
  const [customPrice, setCustomPrice] = useState(0);

  function loadServices() {
    setIsLoading(true);
    startTransition(async () => {
      const result = await getBarberServices(barberId);
      if (!result.success) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }
      setServices(result.services);
      setIsLoading(false);
    });
  }

  function addService(name: string, durationMinutes: number, price: number) {
    startTransition(async () => {
      const result = await adminAddService(barberId, { name, durationMinutes, price });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`"${name}" xidməti əlavə edildi.`);
      setCustomName("");
      loadServices();
    });
  }

  function handleToggle(serviceId: string) {
    startTransition(async () => {
      const result = await adminToggleService(barberId, serviceId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      loadServices();
    });
  }

  function handleDelete(serviceId: string) {
    startTransition(async () => {
      const result = await adminDeleteService(barberId, serviceId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Xidmət silindi.");
      loadServices();
    });
  }

  const existingNames = new Set((services ?? []).map((service) => service.name.trim().toLowerCase()));
  const availableTemplates = SERVICE_TEMPLATES.filter(
    (template) => !existingNames.has(template.name.trim().toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) loadServices();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Scissors className="size-4" />
            Xidmətlər
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{fullName} — Xidmətlər</DialogTitle>
          <DialogDescription>Bərbərin xidmətlərini bura əlavə edə, aktiv/deaktiv edə və silə bilərsiniz.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Yüklənir...</p>
          ) : services && services.length > 0 ? (
            services.map((service) => (
              <div
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{service.name}</span>
                    <Badge variant={service.active ? "default" : "outline"}>
                      {service.active ? "Aktiv" : "Deaktiv"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {service.durationMinutes} dəq · {service.price} {currency}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleToggle(service.id)}
                    aria-label={service.active ? "Deaktiv et" : "Aktiv et"}
                  >
                    {service.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                  <ConfirmActionButton
                    label={<Trash2 className="size-4" />}
                    ariaLabel="Sil"
                    variant="destructive"
                    size="icon-sm"
                    disabled={isPending}
                    title="Xidməti silirsiniz?"
                    description={`"${service.name}" xidməti həmişəlik silinəcək. Əgər bu xidmətlə bağlı rezervasiya mövcuddursa, silinə bilməyəcək.`}
                    confirmLabel="Bəli, sil"
                    onConfirm={() => handleDelete(service.id)}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Hələ xidmət əlavə edilməyib.</p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t pt-3">
          <p className="text-sm font-medium">Şablondan əlavə et</p>
          {availableTemplates.length === 0 ? (
            <p className="text-xs text-muted-foreground">Bütün şablonlar artıq əlavə olunub.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableTemplates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  disabled={isPending}
                  onClick={() => addService(template.name, template.durationMinutes, template.price)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    "hover:border-primary/50 hover:bg-muted disabled:opacity-50"
                  )}
                >
                  <span className="font-medium">{template.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {template.durationMinutes} dəq · {template.price} {currency}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t pt-3">
          <p className="text-sm font-medium">Öz xidmətini əlavə et</p>
          <div className="flex flex-wrap gap-2">
            <Input
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Xidmət adı"
              className="h-9 min-w-0 flex-1"
            />
            <Input
              type="number"
              min={5}
              max={480}
              value={customDuration}
              onChange={(event) => setCustomDuration(Number(event.target.value))}
              className="h-9 w-20"
              aria-label="Müddət (dəq)"
            />
            <Input
              type="number"
              min={0}
              max={100000}
              value={customPrice}
              onChange={(event) => setCustomPrice(Number(event.target.value))}
              className="h-9 w-24"
              aria-label="Qiymət"
            />
            <Button
              type="button"
              size="sm"
              disabled={isPending || !customName.trim()}
              onClick={() => addService(customName.trim(), customDuration, customPrice)}
            >
              <Plus className="size-4" />
              Əlavə et
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
