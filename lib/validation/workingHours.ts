import { z } from "zod";

export const workingHourEntrySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isOff: z.boolean(),
});

export const workingHoursSchema = z.array(workingHourEntrySchema).length(7);

export type WorkingHourEntry = z.infer<typeof workingHourEntrySchema>;
