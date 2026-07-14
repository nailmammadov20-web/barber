import { prisma } from "@/lib/prisma";

const AZ_MAP: Record<string, string> = {
  ə: "e",
  ü: "u",
  ö: "o",
  ğ: "g",
  ş: "s",
  ç: "c",
  ı: "i",
  Ə: "e",
  Ü: "u",
  Ö: "o",
  Ğ: "g",
  Ş: "s",
  Ç: "c",
  İ: "i",
};

function slugify(input: string): string {
  const transliterated = input
    .split("")
    .map((char) => AZ_MAP[char] ?? char)
    .join("");

  return transliterated
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "berber";
}

export async function generateUniqueSlug(fullName: string): Promise<string> {
  const base = slugify(fullName);
  let candidate = base;
  let suffix = 2;

  while (await prisma.barberProfile.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
