import { z } from "zod";

export const artistSchema = z.object({
  name: z.string().min(1, "アーティスト名を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  phone: z.string().optional(),
  equipment: z.string().optional(),
  bankInfo: z.string().optional(),
  notes: z.string().optional(),
});

export type ArtistInput = z.infer<typeof artistSchema>;
