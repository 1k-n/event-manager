import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { taskSchema } from "@/schemas/task";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { taskId } = await params;

  try {
    const body = await request.json();
    const parsed = taskSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : parsed.data.dueDate === "" ? null : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        projectArtist: { include: { artist: { select: { name: true } } } },
      },
    });

    return apiResponse(task);
  } catch {
    return apiError("INTERNAL_ERROR", "タスクの更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { taskId } = await params;

  try {
    await prisma.task.delete({ where: { id: taskId } });
    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "タスクの削除に失敗しました", 500);
  }
}
