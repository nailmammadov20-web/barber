"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { profileSchema } from "@/lib/validation/profile";

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

export async function deleteBarber(barberId: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  // Deleting the User (not just BarberProfile) cascades through the existing
  // onDelete: Cascade relations — BarberProfile, Service, WorkingHour, Booking,
  // ProfileView and Session all get removed with it, and the login is gone too.
  await prisma.user.delete({ where: { id: barber.userId } });

  revalidatePath("/admin");
  revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}

export async function updateBarberBio(barberId: string, bio: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const parsed = profileSchema.shape.bio.safeParse(bio);
  if (!parsed.success) return { success: false, error: "Mətn 500 simvoldan uzun ola bilməz." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  await prisma.barberProfile.update({
    where: { id: barberId },
    data: { bio: parsed.data || null },
  });

  revalidatePath("/admin");
  revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}
