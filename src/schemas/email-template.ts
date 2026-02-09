import { z } from "zod";

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "テンプレート名を入力してください"),
  type: z.enum(["OFFER", "CONFIRMED", "REMINDER", "THANKS"]),
  subject: z.string().min(1, "件名を入力してください"),
  body: z.string().min(1, "本文を入力してください"),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
