import { z } from "zod";

export const timetableEntrySchema = z.object({
  artistName: z.string().min(1, "アーティスト名を入力してください"),
  startTime: z.string().min(1, "開始時刻を入力してください"),
  performanceMinutes: z.coerce.number().min(1, "持ち時間を入力してください"),
  changeoverMinutes: z.coerce.number().min(0).default(0),
  sortOrder: z.coerce.number().default(0),
  type: z.enum(["REHEARSAL", "MAIN"]).default("MAIN"),
  notes: z.string().optional(),
});

export type TimetableEntryInput = z.infer<typeof timetableEntrySchema>;
