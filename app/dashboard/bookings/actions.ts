"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { getAvailableSlots, parseTimeToMinutes, toDateOnly } from "@/lib/slots";
import { manualBlockSchema, type ManualBlockInput } from "@/lib/validation/manualBlock";

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

export async function fetchOwnAvailableSlots(date: string, durationMinutes: number): Promise<string[]> {
  const session = await getCurrentBarber();
  if (!session) return [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || durationMinutes <= 0) return [];

  return getAvailableSlots(session.barber.id, date, durationMinutes);
}

export async function createManualBlock(input: ManualBlockInput): Promise<SimpleResult> {
  const session = await getCurrentBarber();
  if (!session) {
    return { success: false, error: "Sessiya bitib, yenidən daxil olun." };
  }

  const parsed = manualBlockSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Məlumatlar düzgün deyil." };
  }
  const { date, timeSlot, durationMinutes, note } = parsed.data;
  const barberId = session.barber.id;
  const dateOnly = toDateOnly(date);

  const start = parseTimeToMinutes(timeSlot);
  const end = start + durationMinutes;

  const existing = await prisma.booking.findMany({
    where: { barberId, date: dateOnly, status: { in: ["PENDING", "CONFIRMED"] } },
    select: { timeSlot: true, durationMinutes: true },
  });
  const overlaps = existing.some((booking) => {
    const bookingStart = parseTimeToMinutes(booking.timeSlot);
    const bookingEnd = bookingStart + booking.durationMinutes;
    return start < bookingEnd && end > bookingStart;
  });
  if (overlaps) {
    return { success: false, error: "Bu saat artıq tutulub, başqa saat seçin." };
  }

  try {
    await prisma.booking.create({
      data: {
        barberId,
        date: dateOnly,
        timeSlot,
        durationMinutes,
        status: "CONFIRMED",
        isBlock: true,
        customerName: note?.trim() ? note.trim() : "Məşğul (əl ilə bağlanıb)",
        customerPhone: "-",
      },
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Bu saat artıq tutulub, başqa saat seçin." };
    }
    throw error;
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteManualBlock(id: string): Promise<SimpleResult> {
  const session = await getCurrentBarber();
  if (!session) {
    return { success: false, error: "Sessiya bitib, yenidən daxil olun." };
  }

  const existing = await prisma.booking.findFirst({
    where: { id, barberId: session.barber.id, isBlock: true },
  });
  if (!existing) {
    return { success: false, error: "Blok tapılmadı." };
  }

  await prisma.booking.delete({ where: { id } });
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}
