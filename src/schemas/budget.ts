import { z } from "zod";

export const budgetItemSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "カテゴリを入力してください"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "金額は0以上で入力してください"),
  isEstimate: z.boolean().default(true),
});

export type BudgetItemInput = z.infer<typeof budgetItemSchema>;
