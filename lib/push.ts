import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const VAPID_SUBJECT = process.env.VAPID_SUBJECT;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

const isConfigured = Boolean(VAPID_SUBJECT && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (isConfigured) {
  webpush.setVapidDetails(VAPID_SUBJECT!, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
}

export async function sendPushToBarber(
  barberId: string,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  if (!isConfigured) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { barberId } });
  if (subscriptions.length === 0) return;

  const expiredEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(subscription.endpoint);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: expiredEndpoints } } });
  }
}

export async function sendPushToAdmins(payload: { title: string; body: string; url?: string }): Promise<void> {
  if (!isConfigured) return;

  const subscriptions = await prisma.adminPushSubscription.findMany();
  if (subscriptions.length === 0) return;

  const expiredEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(subscription.endpoint);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    await prisma.adminPushSubscription.deleteMany({ where: { endpoint: { in: expiredEndpoints } } });
  }
}
