import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Ad Soyad daxil edin").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{7,20}$/, "Düzgün telefon nömrəsi daxil edin"),
  email: z.string().trim().email("Düzgün email daxil edin"),
  password: z.string().min(6, "Parol ən azı 6 simvol olmalıdır").max(100),
  city: z.string().trim().min(2, "Şəhər daxil edin").max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Düzgün email daxil edin"),
  password: z.string().min(1, "Parol daxil edin"),
});

export type LoginInput = z.infer<typeof loginSchema>;
