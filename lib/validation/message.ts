import { z } from "zod";

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Mesaj boş ola bilməz").max(2000, "Mesaj çox uzundur"),
});

export type MessageInput = z.infer<typeof messageSchema>;
