import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { timetableEntrySchema } from "@/schemas/timetable";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { entryId } = await params;

  try {
    const body = await request.json();
    const parsed = timetableEntrySchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const entry = await prisma.timetableEntry.update({
      where: { id: entryId },
      data: {
        ...parsed.data,
        startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : undefined,
      },
    });

    return apiResponse(entry);
  } catch {
    return apiError("INTERNAL_ERROR", "タイムテーブルの更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { entryId } = await params;

  try {
    await prisma.timetableEntry.delete({ where: { id: entryId } });
    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "タイムテーブルの削除に失敗しました", 500);
  }
}
