"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

type ConfirmResult =
  | {
      success: true;
      booking: {
        customerName: string;
        customerPhone: string;
        barberName: string;
        date: string;
        timeSlot: string;
      };
    }
  | { success: false; error: string };

type SimpleResult = { success: true } | { success: false; error: string };

async function findOwnedBooking(id: string, barberId: string) {
  return prisma.booking.findFirst({ where: { id, barberId } });
}

export async function confirmBooking(id: string): Promise<ConfirmResult> {
  const session = await getCurrentBarber();
  if (!session) {
    return { success: false, error: "Sessiya bitib, yenidən daxil olun." };
  }

  const existing = await findOwnedBooking(id, session.barber.id);
  if (!existing) {
    return { success: false, error: "Rezervasiya tapılmadı." };
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: "CONFIRMED" },
    include: { barber: true },
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");

  return {
    success: true,
    booking: {
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      barberName: booking.barber.fullName,
      date: booking.date.toISOString().slice(0, 10),
      timeSlot: booking.timeSlot,
    },
  };
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<SimpleResult> {
  const session = await getCurrentBarber();
  if (!session) {
    return { success: false, error: "Sessiya bitib, yenidən daxil olun." };
  }

  const existing = await findOwnedBooking(id, session.barber.id);
  if (!existing) {
    return { success: false, error: "Rezervasiya tapılmadı." };
  }

  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}
