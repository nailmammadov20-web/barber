"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { messageSchema } from "@/lib/validation/message";
import { sendPushToAdmins } from "@/lib/push";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export type MessageItem = {
  id: string;
  sender: "BARBER" | "ADMIN";
  body: string;
  createdAt: string;
};

type ActionResult = { success: true } | { success: false; error: string };
type ListResult = { success: true; messages: MessageItem[] } | { success: false; error: string };

export async function getBarberMessages(): Promise<ListResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.noPermission };

  await prisma.message.updateMany({
    where: { barberId: session.barber.id, sender: "ADMIN", readByBarber: false },
    data: { readByBarber: true },
  });

  const messages = await prisma.message.findMany({
    where: { barberId: session.barber.id },
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

export async function sendBarberMessage(body: string): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.noPermission };

  const parsed = messageSchema.safeParse({ body });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.message.create({
    data: {
      barberId: session.barber.id,
      sender: "BARBER",
      body: parsed.data.body,
      readByBarber: true,
      readByAdmin: false,
    },
  });

  await sendPushToAdmins({
    title: `Yeni mesaj — ${session.barber.fullName}`,
    body: parsed.data.body.slice(0, 120),
    url: "/admin/messages",
  });

  revalidatePath("/dashboard/messages");
  return { success: true };
}

export async function getUnreadMessageCount(): Promise<number> {
  const session = await getCurrentBarber();
  if (!session) return 0;

  return prisma.message.count({
    where: { barberId: session.barber.id, sender: "ADMIN", readByBarber: false },
  });
}
