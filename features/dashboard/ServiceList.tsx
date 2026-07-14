"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmActionButton } from "@/features/dashboard/ConfirmActionButton";
import { EditServiceDialog } from "@/features/dashboard/EditServiceDialog";
import { toggleServiceActive, deleteService } from "@/app/dashboard/services/actions";

export type ServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export function ServiceList({ services }: { services: ServiceItem[] }) {
  const [isPending, startTransition] = useTransition();

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
      else toast.success("Xidmət silindi.");
    });
  }

  if (services.length === 0) {
    return <p className="text-sm text-muted-foreground">Hələ xidmət əlavə etməmisiniz.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {services.map((service) => (
        <Card key={service.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-muted-foreground">
                {service.durationMinutes} dəq · {service.price} AZN
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={service.active ? "default" : "outline"}>
                {service.active ? "Aktiv" : "Deaktiv"}
              </Badge>
              <EditServiceDialog service={service} />
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleToggle(service.id)}>
                {service.active ? "Deaktiv et" : "Aktiv et"}
              </Button>
              <ConfirmActionButton
                label="Sil"
                variant="destructive"
                disabled={isPending}
                title="Xidməti silirsiniz?"
                description={`"${service.name}" xidməti həmişəlik silinəcək. Əgər bu xidmətlə bağlı rezervasiya mövcuddursa, silinə bilməyəcək — bu halda əvəzinə deaktiv edin.`}
                confirmLabel="Bəli, sil"
                onConfirm={() => handleDelete(service.id)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
