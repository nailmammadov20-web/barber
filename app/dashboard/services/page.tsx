import { redirect } from "next/navigation";
import { getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AddServiceDialog } from "@/features/dashboard/AddServiceDialog";
import { ServiceList } from "@/features/dashboard/ServiceList";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function DashboardServicesPage() {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  const { services: t } = getDictionary(await getLocale()).dashboard;

  const services = await prisma.service.findMany({
    where: { barberId: session.barber.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t.pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.pageSubtitle}</p>
        </div>
        <AddServiceDialog existingNames={services.map((service) => service.name)} />
      </div>

      <ServiceList services={services} />
    </div>
  );
}
