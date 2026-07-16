"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBarber } from "@/lib/auth/session";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

type ActionResult = { success: true } | { success: false; error: string };
type UploadResult = { success: true; url: string } | { success: false; error: string };

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png"]);

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: getDictionary(await getLocale()).errors.invalidData };
  }

  const { fullName, salonName, phone, city, address, bio, instagramUrl, tiktokUrl, youtubeUrl, facebookUrl, liveOn } =
    parsed.data;

  await prisma.barberProfile.update({
    where: { id: session.barber.id },
    data: {
      fullName,
      salonName: salonName || null,
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

/**
 * Validates an uploaded image and converts it to a data URI. Images are stored
 * inline in the database (not on disk) so they survive on serverless hosts like
 * Vercel, where the filesystem is read-only at runtime.
 */
async function fileToDataUri(entry: FormDataEntryValue | null): Promise<UploadResult> {
  const dict = getDictionary(await getLocale());

  if (!(entry instanceof File) || entry.size === 0) {
    return { success: false, error: dict.errors.imageNotSelected };
  }
  if (!ALLOWED_PHOTO_TYPES.has(entry.type)) {
    return { success: false, error: dict.dashboard.upload.invalidType };
  }
  if (entry.size > MAX_PHOTO_BYTES) {
    return { success: false, error: dict.dashboard.upload.tooLarge };
  }

  const buffer = Buffer.from(await entry.arrayBuffer());
  return { success: true, url: `data:${entry.type};base64,${buffer.toString("base64")}` };
}

export async function uploadProfilePhoto(formData: FormData): Promise<UploadResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const result = await fileToDataUri(formData.get("photo"));
  if (!result.success) return result;

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { photoUrl: result.url } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return result;
}

export async function removeProfilePhoto(): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { photoUrl: null } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function uploadCoverPhoto(formData: FormData): Promise<UploadResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const result = await fileToDataUri(formData.get("cover"));
  if (!result.success) return result;

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { coverUrl: result.url } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return result;
}

export async function removeCoverPhoto(): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { coverUrl: null } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}

export async function uploadLogo(formData: FormData): Promise<UploadResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  const result = await fileToDataUri(formData.get("logo"));
  if (!result.success) return result;

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { logoUrl: result.url } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return result;
}

export async function removeLogo(): Promise<ActionResult> {
  const session = await getCurrentBarber();
  if (!session) return { success: false, error: getDictionary(await getLocale()).errors.sessionExpired };

  await prisma.barberProfile.update({ where: { id: session.barber.id }, data: { logoUrl: null } });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/barber/${session.barber.slug}`);
  return { success: true };
}
