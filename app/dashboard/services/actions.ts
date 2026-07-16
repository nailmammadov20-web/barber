"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { serviceSchema, type ServiceInput } from "@/lib/validation/service";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

type ActionResult = { success: true } | { success: false; error: string };

export async function createService(input: ServiceInput): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: getDictionary(await getLocale()).errors.invalidData };
  }

  await prisma.service.create({
    data: { ...parsed.data, barberId: session.barber.id },
  });

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function createServices(items: ServiceInput[]): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const { errors } = getDictionary(await getLocale());

  if (items.length === 0) {
    return { success: false, error: errors.atLeastOneService };
  }

  const parsedItems: ServiceInput[] = [];
  for (const item of items) {
    const parsed = serviceSchema.safeParse(item);
    if (!parsed.success) {
      return { success: false, error: errors.serviceDataInvalidTemplate.replace("{name}", item.name) };
    }
    parsedItems.push(parsed.data);
  }

  await prisma.service.createMany({
    data: parsedItems.map((item) => ({ ...item, barberId: session.barber.id })),
  });

  revalidatePath("/dashboard/services");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function updateService(id: string, input: ServiceInput): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: getDictionary(await getLocale()).errors.invalidData };
  }

  const existing = await prisma.service.findFirst({ where: { id, barberId: session.barber.id } });
  if (!existing) return { success: false, error: getDictionary(await getLocale()).errors.serviceNotFound };

  await prisma.service.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard/services");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function toggleServiceActive(id: string): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const service = await prisma.service.findFirst({
    where: { id, barberId: session.barber.id },
  });
  if (!service) return { success: false, error: getDictionary(await getLocale()).errors.serviceNotFound };

  await prisma.service.update({ where: { id }, data: { active: !service.active } });
  revalidatePath("/dashboard/services");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const service = await prisma.service.findFirst({
    where: { id, barberId: session.barber.id },
    include: { _count: { select: { bookingServices: true } } },
  });
  if (!service) return { success: false, error: getDictionary(await getLocale()).errors.serviceNotFound };

  if (service._count.bookingServices > 0) {
    return {
      success: false,
      error: getDictionary(await getLocale()).errors.serviceHasBookingsCannotDelete,
    };
  }

  await prisma.service.delete({ where: { id } });
  revalidatePath("/dashboard/services");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}
