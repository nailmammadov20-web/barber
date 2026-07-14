"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";

type ActionResult = { success: true } | { success: false; error: string };
type PhotoResult = { success: true; photoUrl: string } | { success: false; error: string };

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png"]);

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

  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return { success: false, error: "Yalnız JPEG və ya PNG formatı qəbul olunur." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { success: false, error: "Şəkil 2MB-dan böyük ola bilməz." };
  }

  // Stored inline as a data URI (not on disk) so it survives on serverless hosts
  // like Vercel, where the filesystem is read-only at runtime.
  const buffer = Buffer.from(await file.arrayBuffer());
  const photoUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { photoUrl } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true, photoUrl };
}

export async function removeProfilePhoto(): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: "Sessiya bitib, yenidən daxil olun." };

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { photoUrl: null } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}
