import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { taskSchema } from "@/schemas/task";
import { logActivity } from "@/lib/activity-logger";
import { createNotification } from "@/lib/notification-helper";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId, taskId } = await params;

  try {
    const body = await request.json();
    const parsed = taskSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, assigneeId: true, status: true },
    });

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

    const userId = session.user?.id as string;
    const action = parsed.data.status && existing && parsed.data.status !== existing.status
      ? "STATUS_CHANGE" as const
      : "UPDATE" as const;

    await logActivity({
      userId,
      action,
      entityType: "TASK",
      entityId: taskId,
      projectId,
      description: `タスク「${task.title}」を更新しました`,
    });

    if (parsed.data.assigneeId && existing && parsed.data.assigneeId !== existing.assigneeId && parsed.data.assigneeId !== userId) {
      await createNotification({
        userId: parsed.data.assigneeId,
        type: "TASK_ASSIGNED",
        title: "タスクが割り当てられました",
        message: `タスク「${task.title}」が割り当てられました`,
        link: `/projects/${projectId}`,
      });
    }

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

  const { projectId, taskId } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    await prisma.task.delete({ where: { id: taskId } });

    await logActivity({
      userId: session.user?.id as string,
      action: "DELETE",
      entityType: "TASK",
      entityId: taskId,
      projectId,
      description: `タスク「${task?.title || "不明"}」を削除しました`,
    });

    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "タスクの削除に失敗しました", 500);
  }
}
