import { z } from "zod";

export const ticketTypeSchema = z.object({
  name: z.string().min(1, "チケット名を入力してください"),
  price: z.coerce.number().min(0, "価格は0以上にしてください"),
  quantity: z.coerce.number().min(0, "枚数は0以上にしてください").default(0),
});

export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;
