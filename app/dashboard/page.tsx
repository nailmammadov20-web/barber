import { redirect } from "next/navigation";
import { CalendarClock, CircleCheckBig, Hourglass, Wallet } from "lucide-react";
import { getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/slots";
import { todayInBaku } from "@/lib/timezone";
import { isNewSince } from "@/lib/presence";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLinkCard } from "@/features/dashboard/PublicLinkCard";
import { SetupChecklist } from "@/features/dashboard/SetupChecklist";
import { BookingsList } from "@/features/dashboard/BookingsList";
import { OverdueBookingsPrompt } from "@/features/dashboard/OverdueBookingsPrompt";
import { StatusPromoModal } from "@/features/dashboard/StatusPromoModal";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

const NEW_WITHIN_DAYS = 7;

export default async function DashboardOverviewPage() {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  const { common, dashboard } = getDictionary(await getLocale());
  const { overview } = dashboard;

  const barberId = session.barber.id;
  const today = toDateOnly(todayInBaku());
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

  const [
    todayBookings,
    pendingCount,
    completedThisMonth,
    revenueBookings,
    servicesCount,
    workingHoursCount,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: { barberId, date: today },
      include: { services: true },
      orderBy: { timeSlot: "asc" },
    }),
    prisma.booking.count({ where: { barberId, status: "PENDING" } }),
    prisma.booking.count({ where: { barberId, status: "COMPLETED", date: { gte: monthStart } } }),
    prisma.booking.findMany({
      where: { barberId, status: { in: ["CONFIRMED", "COMPLETED"] }, date: { gte: monthStart } },
      include: { services: true },
    }),
    prisma.service.count({ where: { barberId } }),
    prisma.workingHour.count({ where: { barberId } }),
  ]);

  const monthlyRevenue = revenueBookings.reduce(
    (sum, booking) => sum + booking.services.reduce((serviceSum, service) => serviceSum + service.price, 0),
    0
  );

  const stats = [
    { label: overview.statToday, value: todayBookings.length, icon: CalendarClock },
    { label: overview.statPending, value: pendingCount, icon: Hourglass },
    { label: overview.statCompletedMonth, value: completedThisMonth, icon: CircleCheckBig },
    { label: overview.statRevenueMonth, value: `${monthlyRevenue} ${common.currency}`, icon: Wallet },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{overview.title}</h1>
        <p className="text-sm text-muted-foreground">
          {overview.greetingTemplate.replace("{name}", session.barber.fullName)}
        </p>
      </div>

      <OverdueBookingsPrompt
        bookings={todayBookings
          .filter((booking) => booking.status === "CONFIRMED" && !booking.isBlock)
          .map((booking) => ({
            id: booking.id,
            customerName: booking.customerName,
            timeSlot: booking.timeSlot,
            serviceNames: booking.services.map((service) => service.name),
          }))}
      />

      <PublicLinkCard
        slug={session.barber.slug}
        fullName={session.barber.fullName}
        photoUrl={session.barber.photoUrl}
        city={session.barber.city}
        bio={session.barber.bio}
      />

      <StatusPromoModal
        barberId={session.barber.id}
        isNew={isNewSince(session.barber.createdAt, NEW_WITHIN_DAYS)}
        fullName={session.barber.fullName}
        photoUrl={session.barber.photoUrl}
        city={session.barber.city}
        bio={session.barber.bio}
        path={`/barber/${session.barber.slug}`}
      />

      <SetupChecklist hasServices={servicesCount > 0} hasWorkingHours={workingHoursCount > 0} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="flex flex-col gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:size-11">
                <stat.icon className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xl font-semibold sm:text-2xl">{stat.value}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{overview.todaysBookings}</h2>
        <BookingsList
          bookings={todayBookings.map((booking) => ({
            id: booking.id,
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            timeSlot: booking.timeSlot,
            status: booking.status,
            serviceNames: booking.services.map((service) => service.name),
            durationMinutes: booking.durationMinutes,
            isBlock: booking.isBlock,
          }))}
        />
      </div>
    </div>
  );
}
