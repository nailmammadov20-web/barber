"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { workingHoursSchema, type WorkingHourEntry } from "@/lib/validation/workingHours";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

type ActionResult = { success: true } | { success: false; error: string };

export async function saveWorkingHours(entries: WorkingHourEntry[]): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const parsed = workingHoursSchema.safeParse(entries);
  if (!parsed.success) {
    return { success: false, error: getDictionary(await getLocale()).errors.invalidData };
  }

  const barberId = session.barber.id;

  await Promise.all(
    parsed.data.map((entry) =>
      prisma.workingHour.upsert({
        where: { barberId_weekday: { barberId, weekday: entry.weekday } },
        update: { startTime: entry.startTime, endTime: entry.endTime, isOff: entry.isOff },
        create: { barberId, ...entry },
      })
    )
  );

  revalidatePath("/dashboard/hours");
  return { success: true };
}
