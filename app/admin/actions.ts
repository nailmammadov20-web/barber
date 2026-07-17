"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";
import { sendPushToBarber } from "@/lib/push";

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

export async function sendInstallAppReminder(barberId: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  const subscription = await prisma.pushSubscription.findFirst({ where: { barberId } });
  if (!subscription) {
    return { success: false, error: "Bu bərbər hələ bildirişlərə abunə olmayıb, bildiriş göndərilə bilmədi." };
  }

  await sendPushToBarber(barberId, {
    title: "Tətbiqi telefonunuza yükləyin",
    body: "BarberHub-u ana ekrana əlavə edin ki, daha sürətli daxil olasınız.",
    url: "/dashboard/settings",
  });

  return { success: true };
}

export async function updateBarberProfile(
  barberId: string,
  input: ProfileInput & { email: string }
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const { email, ...profileInput } = input;
  const parsed = profileSchema.safeParse(profileInput);
  if (!parsed.success) return { success: false, error: "Məlumatlar düzgün deyil." };

  const emailParsed = z.string().trim().toLowerCase().email("Düzgün email daxil edin").safeParse(email);
  if (!emailParsed.success) return { success: false, error: "Düzgün email daxil edin." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  const existingEmail = await prisma.user.findUnique({ where: { email: emailParsed.data } });
  if (existingEmail && existingEmail.id !== barber.userId) {
    return { success: false, error: "Bu email artıq başqa hesabda istifadə olunub." };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: barber.userId }, data: { email: emailParsed.data } }),
    prisma.barberProfile.update({
      where: { id: barberId },
      data: {
        fullName: parsed.data.fullName,
        salonName: parsed.data.salonName || null,
        phone: parsed.data.phone,
        city: parsed.data.city,
        address: parsed.data.address || null,
        bio: parsed.data.bio || null,
        instagramUrl: parsed.data.instagramUrl || null,
        tiktokUrl: parsed.data.tiktokUrl || null,
        youtubeUrl: parsed.data.youtubeUrl || null,
        facebookUrl: parsed.data.facebookUrl || null,
        liveOn: parsed.data.liveOn || null,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}
