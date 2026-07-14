import { redirect } from "next/navigation";
import { getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AddServiceDialog } from "@/features/dashboard/AddServiceDialog";
import { ServiceList } from "@/features/dashboard/ServiceList";

export default async function DashboardServicesPage() {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  const services = await prisma.service.findMany({
    where: { barberId: session.barber.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Xidmətlər</h1>
          <p className="text-sm text-muted-foreground">
            Müştərilərin ictimai səhifənizdə görəcəyi xidmətləri idarə edin.
          </p>
        </div>
        <AddServiceDialog />
      </div>

      <ServiceList services={services} />
    </div>
  );
}
