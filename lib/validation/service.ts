import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Xidmət adı daxil edin").max(100),
  durationMinutes: z.number().int().min(5, "Ən azı 5 dəqiqə").max(480),
  price: z.number().int().min(0, "Qiymət mənfi ola bilməz").max(100000),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
