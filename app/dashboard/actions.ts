"use server";

import { redirect } from "next/navigation";
import { destroySession, getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function pingPresence(): Promise<void> {
  const session = await getCurrentBarber();
  if (!session) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastActiveAt: new Date() },
  });
}

type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type ActionResult = { success: true } | { success: false; error: string };

export async function subscribeToPush(subscription: PushSubscriptionInput): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.noPermission };

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { barberId: session.barber.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      barberId: session.barber.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return { success: true };
}

export async function unsubscribeFromPush(endpoint: string): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.noPermission };

  await prisma.pushSubscription.deleteMany({ where: { endpoint, barberId: session.barber.id } });
  return { success: true };
}
