import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  projectArtistId: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
