"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

type ActionResult = { success: true } | { success: false; error: string };
type ResetPasswordResult = { success: true; newPassword: string } | { success: false; error: string };

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

export async function resetBarberPassword(barberId: string): Promise<ResetPasswordResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  const newPassword = randomBytes(8).toString("hex");
  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: barber.userId }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: barber.userId } }),
  ]);

  return { success: true, newPassword };
}
