import { redirect } from "next/navigation";
import { CalendarCheck, CircleCheckBig, Users, Wallet } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatDateDisplay } from "@/lib/formatDate";
import { isInactiveSince, isNewSince, isOnline } from "@/lib/presence";
import { detectCountryFromPhone, COUNTRY_LABEL, COUNTRY_CURRENCY, type BarberCountry } from "@/lib/country";
import { Card, CardContent } from "@/components/ui/card";
import { AdminBarberList, type AdminBarberItem } from "@/features/admin/AdminBarberList";

const NEW_WITHIN_DAYS = 7;
const INACTIVE_AFTER_DAYS = 30;

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const [barbers, totalBarbers, activeBarbers, totalBookings, revenueBookings] = await Promise.all([
    prisma.barberProfile.findMany({
      include: {
        user: true,
        _count: { select: { bookings: true, services: true, workingHours: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.barberProfile.count(),
    prisma.barberProfile.count({ where: { active: true } }),
    prisma.booking.count(),
    prisma.booking.findMany({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      select: { barberId: true, services: { select: { price: true } } },
    }),
  ]);

  const revenueByBarber = new Map<string, number>();
  for (const booking of revenueBookings) {
    const bookingTotal = booking.services.reduce((sum, service) => sum + service.price, 0);
    revenueByBarber.set(booking.barberId, (revenueByBarber.get(booking.barberId) ?? 0) + bookingTotal);
  }

  const items: AdminBarberItem[] = barbers.map((barber) => {
    const lastActiveAt = barber.user.lastActiveAt;
    const country = detectCountryFromPhone(barber.phone);
    return {
      id: barber.id,
      fullName: barber.fullName,
      email: barber.user.email,
      phone: barber.phone,
      city: barber.city,
      slug: barber.slug,
      active: barber.active,
      bookingsCount: barber._count.bookings,
      revenue: revenueByBarber.get(barber.id) ?? 0,
      currency: COUNTRY_CURRENCY[country],
      country,
      bio: barber.bio ?? "",
      salonName: barber.salonName ?? "",
      address: barber.address ?? "",
      instagramUrl: barber.instagramUrl ?? "",
      tiktokUrl: barber.tiktokUrl ?? "",
      youtubeUrl: barber.youtubeUrl ?? "",
      facebookUrl: barber.facebookUrl ?? "",
      liveOn: barber.liveOn ?? "",
      createdAtDisplay: formatDateDisplay(barber.createdAt.toISOString().slice(0, 10)),
      isOnline: isOnline(lastActiveAt),
      isNew: isNewSince(barber.createdAt, NEW_WITHIN_DAYS),
      isInactive: isInactiveSince(lastActiveAt, INACTIVE_AFTER_DAYS),
      isProfileComplete: Boolean(barber.photoUrl) && barber._count.services > 0 && barber._count.workingHours > 0,
      lastActiveDisplay: lastActiveAt
        ? formatDateDisplay(lastActiveAt.toISOString().slice(0, 10))
        : "Heç vaxt daxil olmayıb",
    };
  });

  const revenueByCurrency = new Map<string, number>();
  for (const item of items) {
    revenueByCurrency.set(item.currency, (revenueByCurrency.get(item.currency) ?? 0) + item.revenue);
  }
  const revenueDisplay = Array.from(revenueByCurrency.entries())
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => `${amount} ${currency}`)
    .join(" + ") || `0 AZN`;

  const countryCounts = new Map<BarberCountry, number>();
  for (const item of items) {
    countryCounts.set(item.country, (countryCounts.get(item.country) ?? 0) + 1);
  }
  const countryBreakdown = Array.from(countryCounts.entries())
    .filter(([country]) => country !== "OTHER")
    .map(([country, count]) => `${COUNTRY_LABEL[country]}: ${count}`)
    .join(" · ");

  const stats = [
    { label: "Ümumi bərbərlər", value: totalBarbers, icon: Users },
    { label: "Aktiv bərbərlər", value: activeBarbers, icon: CircleCheckBig },
    { label: "Ümumi rezervasiyalar", value: totalBookings, icon: CalendarCheck },
    { label: "Ümumi qazanc", value: revenueDisplay, icon: Wallet },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bərbərlər</h1>
        <p className="text-sm text-muted-foreground">Platformadakı bütün bərbər hesablarını idarə edin.</p>
        {countryBreakdown && <p className="mt-1 text-xs text-muted-foreground">{countryBreakdown}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="flex flex-col gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:size-11">
                <stat.icon className="size-4 sm:size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold break-words sm:text-2xl">{stat.value}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminBarberList barbers={items} />
    </div>
  );
}
