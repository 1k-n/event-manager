import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { timetableEntrySchema } from "@/schemas/timetable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  const entries = await prisma.timetableEntry.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
  });

  return apiResponse(entries);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  try {
    const body = await request.json();
    const parsed = timetableEntrySchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const entryType = parsed.data.type || "MAIN";

    const maxOrder = await prisma.timetableEntry.findFirst({
      where: { projectId, type: entryType },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const entry = await prisma.timetableEntry.create({
      data: {
        projectId,
        type: entryType,
        artistName: parsed.data.artistName,
        startTime: new Date(parsed.data.startTime),
        performanceMinutes: parsed.data.performanceMinutes,
        changeoverMinutes: parsed.data.changeoverMinutes,
        sortOrder: parsed.data.sortOrder || (maxOrder ? maxOrder.sortOrder + 1 : 1),
        notes: parsed.data.notes || null,
      },
    });

    return apiResponse(entry);
  } catch {
    return apiError("INTERNAL_ERROR", "タイムテーブルの作成に失敗しました", 500);
  }
}
