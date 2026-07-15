"use server";

import { redirect } from "next/navigation";
import { destroySession, getCurrentBarber } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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
