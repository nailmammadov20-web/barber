"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";

type ActionResult = { success: true } | { success: false; error: string };
type PhotoResult = { success: true; photoUrl: string } | { success: false; error: string };

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

async function deleteLocalPhoto(photoUrl: string | null) {
  if (!photoUrl || !photoUrl.startsWith("/uploads/avatars/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", photoUrl));
  } catch {
    // best-effort cleanup; fine if the file was already removed
  }
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Məlumatlar düzgün deyil." };
  }

  const { fullName, phone, city, address, bio, instagramUrl, tiktokUrl, youtubeUrl, facebookUrl, liveOn } =
    parsed.data;

  await prisma.barberProfile.update({
    where: { id: session.barber.id },
    data: {
      fullName,
      phone,
      city,
      address: address || null,
      bio: bio || null,
      instagramUrl: instagramUrl || null,
      tiktokUrl: tiktokUrl || null,
      youtubeUrl: youtubeUrl || null,
      facebookUrl: facebookUrl || null,
      liveOn: liveOn || null,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function uploadProfilePhoto(formData: FormData): Promise<PhotoResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Şəkil seçilməyib." };
  }

  const extension = ALLOWED_PHOTO_TYPES[file.type];
  if (!extension) {
    return { success: false, error: "Yalnız JPEG və ya PNG formatı qəbul olunur." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { success: false, error: "Şəkil 4MB-dan böyük ola bilməz." };
  }

  const barber = await prisma.barberProfile.findUnique({ where: { id: session.barber.id } });
  if (!barber) return { success: false, error: "Profil tapılmadı." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${barber.id}-${Date.now()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const photoUrl = `/uploads/avatars/${filename}`;
  await deleteLocalPhoto(barber.photoUrl);
  await prisma.barberProfile.update({ where: { id: barber.id }, data: { photoUrl } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${barber.slug}`);
  return { success: true, photoUrl };
}

export async function removeProfilePhoto(): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  const barber = await prisma.barberProfile.findUnique({ where: { id: session.barber.id } });
  if (!barber) return { success: false, error: "Profil tapılmadı." };

  await deleteLocalPhoto(barber.photoUrl);
  await prisma.barberProfile.update({ where: { id: barber.id }, data: { photoUrl: null } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${barber.slug}`);
  return { success: true };
}
