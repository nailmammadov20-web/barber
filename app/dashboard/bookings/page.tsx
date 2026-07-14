import { redirect } from "next/navigation";
import { getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/slots";
import { todayInBaku } from "@/lib/timezone";
import { BookingsFilterBar } from "@/features/dashboard/BookingsFilterBar";
import { BookingsList } from "@/features/dashboard/BookingsList";
import type { Prisma } from "@/lib/generated/prisma/client";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

export default async function DashboardBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; q?: string }>;
}) {
  const session = await getCurrentBarber();
  if (!session) redirect("/login");

  const params = await searchParams;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayInBaku();
  const status = params.status && (VALID_STATUSES as readonly string[]).includes(params.status) ? params.status : "";
  const query = params.q?.trim() ?? "";

  const where: Prisma.BookingWhereInput = { barberId: session.barber.id };
  if (status) where.status = status as (typeof VALID_STATUSES)[number];
  if (query) {
    where.OR = [
      { customerName: { contains: query, mode: "insensitive" } },
      { customerPhone: { contains: query } },
    ];
  } else {
    where.date = toDateOnly(date);
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { services: true },
    orderBy: query ? { date: "desc" } : { timeSlot: "asc" },
    take: query ? 50 : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Rezervasiyalar</h1>
        <p className="text-sm text-muted-foreground">Rezervasiyalarınızı izləyin və təsdiqləyin.</p>
      </div>

      <BookingsFilterBar date={date} status={status} />

      <BookingsList
        bookings={bookings.map((booking) => ({
          id: booking.id,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          timeSlot: booking.timeSlot,
          status: booking.status,
          serviceNames: booking.services.map((service) => service.name),
          durationMinutes: booking.durationMinutes,
          date: query ? booking.date.toISOString().slice(0, 10) : undefined,
        }))}
      />
    </div>
  );
}
