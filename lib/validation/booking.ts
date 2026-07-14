import { z } from "zod";

export const bookingSchema = z.object({
  serviceIds: z.array(z.string().min(1)).min(1, "Ən azı bir xidmət seçin"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarix seçin"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Saat seçin"),
  customerName: z.string().trim().min(2, "Ad-soyad daxil edin").max(100),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{7,20}$/, "Düzgün telefon nömrəsi daxil edin"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const customerStorageSchema = z.object({
  customerName: z.string(),
  customerPhone: z.string(),
});

export type StoredCustomer = z.infer<typeof customerStorageSchema>;
