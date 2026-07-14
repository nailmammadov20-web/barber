"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/session";

type ActionResult = { success: true } | { success: false; error: string };

export async function toggleBarberActive(barberId: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  await prisma.barberProfile.update({
    where: { id: barberId },
    data: { active: !barber.active },
  });

  revalidatePath("/admin");
  revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}
