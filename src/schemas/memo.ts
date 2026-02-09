import { z } from "zod";

export const memoSchema = z.object({
  content: z.string().min(1, "内容を入力してください"),
  type: z.enum(["MEMO", "MESSAGE"]).default("MEMO"),
  authorName: z.string().optional(),
});

export type MemoInput = z.infer<typeof memoSchema>;
