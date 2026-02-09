import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "プロジェクト名を入力してください"),
  description: z.string().optional(),
  eventDate: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
