"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmActionButton } from "@/features/dashboard/ConfirmActionButton";
import { EditServiceDialog } from "@/features/dashboard/EditServiceDialog";
import { toggleServiceActive, deleteService } from "@/app/dashboard/services/actions";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export type ServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export function ServiceList({ services }: { services: ServiceItem[] }) {
  const [isPending, startTransition] = useTransition();
  const { common, dashboard } = useDictionary();
  const t = dashboard.services;

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await toggleServiceActive(id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteService(id);
      if (!result.success) toast.error(result.error);
      else toast.success(t.deletedToast);
    });
  }

  if (services.length === 0) {
    return <p className="text-sm text-muted-foreground">{t.emptyList}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {services.map((service) => (
        <Card key={service.id}>
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium">{service.name}</p>
                <Badge variant={service.active ? "default" : "outline"}>
                  {service.active ? t.active : t.inactive}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {service.durationMinutes} {t.minutesAbbr} · {service.price} {common.currency}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <EditServiceDialog service={service} />
              <Button
                size="icon-sm"
                variant="outline"
                disabled={isPending}
                onClick={() => handleToggle(service.id)}
                aria-label={service.active ? t.deactivate : t.activate}
              >
                {service.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <ConfirmActionButton
                label={<Trash2 className="size-4" />}
                ariaLabel={t.deleteAria}
                variant="destructive"
                size="icon-sm"
                disabled={isPending}
                title={t.deleteConfirmTitle}
                description={t.deleteConfirmDescTemplate.replace("{name}", service.name)}
                confirmLabel={t.yesDelete}
                onConfirm={() => handleDelete(service.id)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
