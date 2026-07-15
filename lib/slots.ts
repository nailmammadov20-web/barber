import { prisma } from "@/lib/prisma";
import { nowMinutesInBaku, todayInBaku } from "@/lib/timezone";

const SLOT_MINUTES = 30;

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function toDateOnly(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

/**
 * Returns start times where a booking of `durationMinutes` fits entirely within
 * working hours without overlapping any existing PENDING/CONFIRMED booking's
 * own [start, start+duration) range for that barber/date.
 */
export async function getAvailableSlots(
  barberId: string,
  dateString: string,
  durationMinutes: number
): Promise<string[]> {
  const date = toDateOnly(dateString);
  const weekday = date.getUTCDay();

  const workingHour = await prisma.workingHour.findUnique({
    where: { barberId_weekday: { barberId, weekday } },
  });

  if (!workingHour || workingHour.isOff || durationMinutes <= 0) {
    return [];
  }

  const startMinutes = parseTimeToMinutes(workingHour.startTime);
  const endMinutes = parseTimeToMinutes(workingHour.endTime);

  const existing = await prisma.booking.findMany({
    where: {
      barberId,
      date,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { timeSlot: true, durationMinutes: true },
  });

  const busyRanges = existing.map((booking) => {
    const start = parseTimeToMinutes(booking.timeSlot);
    return { start, end: start + booking.durationMinutes };
  });

  const isToday = dateString === todayInBaku();
  const nowMinutes = nowMinutesInBaku();

  const slots: string[] = [];
  for (let start = startMinutes; start + durationMinutes <= endMinutes; start += SLOT_MINUTES) {
    if (isToday && start <= nowMinutes) continue;
    const end = start + durationMinutes;
    const overlaps = busyRanges.some((range) => start < range.end && end > range.start);
    if (!overlaps) {
      slots.push(minutesToTime(start));
    }
  }

  return slots;
}
