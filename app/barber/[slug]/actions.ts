"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, toDateOnly } from "@/lib/slots";
import { bookingSchema, type BookingInput } from "@/lib/validation/booking";

async function resolveActiveServices(serviceIds: string[]) {
  const uniqueIds = Array.from(new Set(serviceIds));
  const services = await prisma.service.findMany({ where: { id: { in: uniqueIds }, active: true } });

  if (services.length !== uniqueIds.length) return null;

  const barberId = services[0]?.barberId;
  if (!barberId || services.some((service) => service.barberId !== barberId)) return null;

  return { services, barberId };
}

export async function fetchAvailableSlots(serviceIds: string[], date: string): Promise<string[]> {
  if (serviceIds.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return [];
  }

  const resolved = await resolveActiveServices(serviceIds);
  if (!resolved) return [];

  const totalDuration = resolved.services.reduce((sum, service) => sum + service.durationMinutes, 0);
  return getAvailableSlots(resolved.barberId, date, totalDuration);
}

type CreateBookingResult = { success: true } | { success: false; error: string };

export async function createBooking(input: BookingInput): Promise<CreateBookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Məlumatlar düzgün deyil, formu yenidən yoxlayın." };
  }
  const { serviceIds, date, timeSlot, customerName, customerPhone } = parsed.data;

  const resolved = await resolveActiveServices(serviceIds);
  if (!resolved) {
    return { success: false, error: "Seçilmiş xidmətlərdən biri tapılmadı." };
  }
  const { services, barberId } = resolved;
  const totalDuration = services.reduce((sum, service) => sum + service.durationMinutes, 0);

  const available = await getAvailableSlots(barberId, date, totalDuration);
  if (!available.includes(timeSlot)) {
    return { success: false, error: "Bu saat artıq tutulub və ya kifayət qədər ardıcıl vaxt yoxdur, başqa saat seçin." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          barberId,
          date: toDateOnly(date),
          timeSlot,
          durationMinutes: totalDuration,
          customerName,
          customerPhone,
          status: "PENDING",
        },
      });

      await tx.bookingService.createMany({
        data: services.map((service) => ({
          bookingId: booking.id,
          serviceId: service.id,
          name: service.name,
          price: service.price,
          durationMinutes: service.durationMinutes,
        })),
      });
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
