"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";
import { serviceSchema, type ServiceInput } from "@/lib/validation/service";
import { messageSchema } from "@/lib/validation/message";
import { sendPushToBarber } from "@/lib/push";

type ActionResult = { success: true } | { success: false; error: string };
type ResetPasswordResult = { success: true; newPassword: string } | { success: false; error: string };
type BarberServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};
type ListServicesResult = { success: true; services: BarberServiceItem[] } | { success: false; error: string };

export type AdminMessageItem = {
  id: string;
  sender: "BARBER" | "ADMIN";
  body: string;
  createdAt: string;
};
type AdminMessagesResult = { success: true; messages: AdminMessageItem[] } | { success: false; error: string };

export type ConversationItem = {
  barberId: string;
  fullName: string;
  lastMessage: string;
  lastMessageAt: string;
  lastSender: "BARBER" | "ADMIN";
  unreadCount: number;
};
type ConversationsResult =
  | { success: true; conversations: ConversationItem[] }
  | { success: false; error: string };

type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };

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

export async function getBarberServices(barberId: string): Promise<ListServicesResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const services = await prisma.service.findMany({
    where: { barberId },
    orderBy: { createdAt: "asc" },
  });

  return {
    success: true,
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price,
      active: service.active,
    })),
  };
}

export async function adminAddService(barberId: string, input: ServiceInput): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Məlumatlar düzgün deyil." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  await prisma.service.create({ data: { ...parsed.data, barberId } });

  revalidatePath("/admin");
  revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}

export async function adminToggleService(barberId: string, serviceId: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const service = await prisma.service.findFirst({ where: { id: serviceId, barberId } });
  if (!service) return { success: false, error: "Xidmət tapılmadı." };

  await prisma.service.update({ where: { id: serviceId }, data: { active: !service.active } });

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  revalidatePath("/admin");
  if (barber) revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}

export async function adminDeleteService(barberId: string, serviceId: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const service = await prisma.service.findFirst({
    where: { id: serviceId, barberId },
    include: { _count: { select: { bookingServices: true } } },
  });
  if (!service) return { success: false, error: "Xidmət tapılmadı." };

  if (service._count.bookingServices > 0) {
    return {
      success: false,
      error: "Bu xidmətlə bağlı rezervasiyalar mövcud olduğu üçün silinə bilməz. Əvəzinə deaktiv edin.",
    };
  }

  await prisma.service.delete({ where: { id: serviceId } });

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  revalidatePath("/admin");
  if (barber) revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}

export async function getAdminConversations(): Promise<ConversationsResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const barbers = await prisma.barberProfile.findMany({
    select: {
      id: true,
      fullName: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { fullName: "asc" },
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ["barberId"],
    where: { sender: "BARBER", readByAdmin: false },
    _count: { _all: true },
  });
  const unreadMap = new Map(unreadCounts.map((row) => [row.barberId, row._count._all]));

  const conversations = barbers
    .map((barber) => ({
      barberId: barber.id,
      fullName: barber.fullName,
      lastMessage: barber.messages[0]?.body ?? "",
      lastMessageAt: barber.messages[0]?.createdAt.toISOString() ?? "",
      lastSender: (barber.messages[0]?.sender ?? "BARBER") as "BARBER" | "ADMIN",
      unreadCount: unreadMap.get(barber.id) ?? 0,
    }))
    .sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return a.fullName.localeCompare(b.fullName);
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    });

  return { success: true, conversations };
}

export async function getConversationMessages(barberId: string): Promise<AdminMessagesResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  await prisma.message.updateMany({
    where: { barberId, sender: "BARBER", readByAdmin: false },
    data: { readByAdmin: true },
  });

  const messages = await prisma.message.findMany({
    where: { barberId },
    orderBy: { createdAt: "asc" },
  });

  return {
    success: true,
    messages: messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

export async function sendAdminMessage(barberId: string, body: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  const parsed = messageSchema.safeParse({ body });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
  if (!barber) return { success: false, error: "Bərbər tapılmadı." };

  await prisma.message.create({
    data: {
      barberId,
      sender: "ADMIN",
      body: parsed.data.body,
      readByAdmin: true,
      readByBarber: false,
    },
  });

  await sendPushToBarber(barberId, {
    title: "Admindən yeni mesaj",
    body: parsed.data.body.slice(0, 120),
    url: "/dashboard/messages",
  });

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function getAdminUnreadMessageCount(): Promise<number> {
  const admin = await getCurrentAdmin();
  if (!admin) return 0;

  return prisma.message.count({ where: { sender: "BARBER", readByAdmin: false } });
}

export async function subscribeAdminToPush(subscription: PushSubscriptionInput): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  await prisma.adminPushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { adminId: admin.user.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      adminId: admin.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return { success: true };
}

export async function unsubscribeAdminFromPush(endpoint: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "Səlahiyyətiniz yoxdur." };

  await prisma.adminPushSubscription.deleteMany({ where: { endpoint, adminId: admin.user.id } });
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
