import { z } from "zod";

export const manualBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarix seçin"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Saat seçin"),
  durationMinutes: z.number().int().min(15, "Ən azı 15 dəqiqə").max(480, "Maksimum 8 saat"),
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export type ManualBlockInput = z.infer<typeof manualBlockSchema>;
