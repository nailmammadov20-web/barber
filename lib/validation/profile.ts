import { z } from "zod";

const optionalUrl = z.string().trim().url("Düzgün URL daxil edin").optional().or(z.literal(""));

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Ad Soyad daxil edin").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{7,20}$/, "Düzgün telefon nömrəsi daxil edin"),
  city: z.string().trim().min(2, "Şəhər daxil edin").max(100),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  facebookUrl: optionalUrl,
  liveOn: z.enum(["", "INSTAGRAM", "TIKTOK", "YOUTUBE", "FACEBOOK"]).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
