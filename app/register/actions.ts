"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { generateUniqueSlug } from "@/lib/slug";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

type RegisterResult = { success: true } | { success: false; error: string };

export async function registerBarber(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: getDictionary(await getLocale()).errors.invalidDataRetry };
  }
  const { fullName, phone, email, password, city } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: getDictionary(await getLocale()).errors.emailTaken };
  }

  const passwordHash = await hashPassword(password);
  const slug = await generateUniqueSlug(fullName);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      barberProfile: {
        create: { fullName, phone, city, slug },
      },
    },
  });

  await createSession(user.id);
  return { success: true };
}
