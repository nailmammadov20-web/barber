import { redirect } from "next/navigation";
import { getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { WorkingHoursForm } from "@/features/dashboard/WorkingHoursForm";
import type { WorkingHourEntry } from "@/lib/validation/workingHours";

export default async function DashboardHoursPage() {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  const existing = await prisma.workingHour.findMany({ where: { barberId: session.barber.id } });
  const byWeekday = new Map(existing.map((entry) => [entry.weekday, entry]));

  const initialHours: WorkingHourEntry[] = Array.from({ length: 7 }, (_, weekday) => {
    const found = byWeekday.get(weekday);
    return {
      weekday,
      startTime: found?.startTime ?? "09:00",
      endTime: found?.endTime ?? "19:00",
      isOff: found?.isOff ?? weekday === 0,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">İş saatları</h1>
        <p className="text-sm text-muted-foreground">Hər gün üçün işlədiyiniz saatları təyin edin.</p>
      </div>
      <WorkingHoursForm initialHours={initialHours} />
    </div>
  );
}
