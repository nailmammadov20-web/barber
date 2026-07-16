"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import type { Role } from "@/lib/generated/prisma/client";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LoginResult = { success: true; role: Role } | { success: false; error: string };

export async function loginBarber(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: getDictionary(await getLocale()).errors.invalidData };
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: getDictionary(await getLocale()).errors.wrongCredentials };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: getDictionary(await getLocale()).errors.wrongCredentials };
  }

  await createSession(user.id);
  return { success: true, role: user.role };
}
