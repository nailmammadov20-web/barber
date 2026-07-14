import { redirect } from "next/navigation";
import { CalendarCheck, CircleCheckBig, Users } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatDateDisplay } from "@/lib/formatDate";
import { Card, CardContent } from "@/components/ui/card";
import { AdminBarberList, type AdminBarberItem } from "@/features/admin/AdminBarberList";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const [barbers, totalBarbers, activeBarbers, totalBookings] = await Promise.all([
    prisma.barberProfile.findMany({
      include: { user: true, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.barberProfile.count(),
    prisma.barberProfile.count({ where: { active: true } }),
    prisma.booking.count(),
  ]);

  const items: AdminBarberItem[] = barbers.map((barber) => ({
    id: barber.id,
    fullName: barber.fullName,
    email: barber.user.email,
    phone: barber.phone,
    city: barber.city,
    slug: barber.slug,
    active: barber.active,
    bookingsCount: barber._count.bookings,
    createdAtDisplay: formatDateDisplay(barber.createdAt.toISOString().slice(0, 10)),
  }));

  const stats = [
    { label: "Ümumi bərbərlər", value: totalBarbers, icon: Users },
    { label: "Aktiv bərbərlər", value: activeBarbers, icon: CircleCheckBig },
    { label: "Ümumi rezervasiyalar", value: totalBookings, icon: CalendarCheck },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bərbərlər</h1>
        <p className="text-sm text-muted-foreground">Platformadakı bütün bərbər hesablarını idarə edin.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminBarberList barbers={items} />
    </div>
  );
}
