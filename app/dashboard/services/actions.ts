"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { serviceSchema, type ServiceInput } from "@/lib/validation/service";

type ActionResult = { success: true } | { success: false; error: string };

export async function createService(input: ServiceInput): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Məlumatlar düzgün deyil." };
  }

  await prisma.service.create({
    data: { ...parsed.data, barberId: session.barber.id },
  });

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function updateService(id: string, input: ServiceInput): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Məlumatlar düzgün deyil." };
  }

  const existing = await prisma.service.findFirst({ where: { id, barberId: session.barber.id } });
  if (!existing) return { success: false, error: "Xidmət tapılmadı." };

  await prisma.service.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard/services");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function toggleServiceActive(id: string): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  const service = await prisma.service.findFirst({
    where: { id, barberId: session.barber.id },
  });
  if (!service) return { success: false, error: "Xidmət tapılmadı." };

  await prisma.service.update({ where: { id }, data: { active: !service.active } });
  revalidatePath("/dashboard/services");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  const service = await prisma.service.findFirst({
    where: { id, barberId: session.barber.id },
    include: { _count: { select: { bookingServices: true } } },
  });
  if (!service) return { success: false, error: "Xidmət tapılmadı." };

  if (service._count.bookingServices > 0) {
    return {
      success: false,
      error: "Bu xidmətlə bağlı rezervasiyalar mövcud olduğu üçün silinə bilməz. Əvəzinə deaktiv edin.",
    };
  }

  await prisma.service.delete({ where: { id } });
  revalidatePath("/dashboard/services");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}
