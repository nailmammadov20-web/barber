import { prisma } from "@/lib/prisma";

const ACTIVE_WINDOW_MS = 60_000;

export type ViewStats = { totalViews: number; currentlyViewing: number };

export async function getViewStats(barberId: string): Promise<ViewStats> {
  const [totalViews, currentlyViewing] = await Promise.all([
    prisma.profileView.count({ where: { barberId } }),
    prisma.profileView.count({
      where: { barberId, lastSeenAt: { gte: new Date(Date.now() - ACTIVE_WINDOW_MS) } },
    }),
  ]);
  return { totalViews, currentlyViewing };
}

export async function trackProfileView(barberId: string, visitorId: string): Promise<void> {
  await prisma.profileView.upsert({
    where: { barberId_visitorId: { barberId, visitorId } },
    create: { barberId, visitorId },
    update: { lastSeenAt: new Date() },
  });
}
