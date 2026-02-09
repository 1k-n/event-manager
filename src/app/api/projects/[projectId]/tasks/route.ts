import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { taskSchema } from "@/schemas/task";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true } },
      projectArtist: { include: { artist: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(tasks);
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

    // 複数アーティスト一括作成
    const projectArtistIds: string[] = body.projectArtistIds || [];
    if (projectArtistIds.length > 0) {
      const parsed = taskSchema.safeParse(body);
      if (!parsed.success) {
        return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
      }

      const tasks = await prisma.$transaction(
        projectArtistIds.map((paId) =>
          prisma.task.create({
            data: {
              projectId,
              title: parsed.data.title,
              description: parsed.data.description || null,
              priority: parsed.data.priority,
              status: parsed.data.status,
              dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
              assigneeId: parsed.data.assigneeId || null,
              projectArtistId: paId,
            },
            include: {
              assignee: { select: { id: true, name: true } },
              projectArtist: { include: { artist: { select: { name: true } } } },
            },
          })
        )
      );

      return apiResponse(tasks);
    }

    // 単一作成（従来互換）
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        priority: parsed.data.priority,
        status: parsed.data.status,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assigneeId: parsed.data.assigneeId || null,
        projectArtistId: parsed.data.projectArtistId || null,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        projectArtist: { include: { artist: { select: { name: true } } } },
      },
    });

    return apiResponse(task);
  } catch {
    return apiError("INTERNAL_ERROR", "タスクの作成に失敗しました", 500);
  }
}
