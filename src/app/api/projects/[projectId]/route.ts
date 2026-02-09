import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { projectSchema } from "@/schemas/project";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId, isDeleted: false },
    include: {
      projectArtists: {
        include: {
          artist: true,
          statusHistories: {
            include: { changedBy: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      timetableEntries: { orderBy: { sortOrder: "asc" } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true } },
          projectArtist: { include: { artist: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
      budgetItems: { orderBy: { createdAt: "desc" } },
      ticketTypes: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!project) {
    return apiError("NOT_FOUND", "プロジェクトが見つかりません", 404);
  }

  return apiResponse(project);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  try {
    const body = await request.json();
    const parsed = projectSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...parsed.data,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : undefined,
      },
    });

    return apiResponse(project);
  } catch {
    return apiError("INTERNAL_ERROR", "プロジェクトの更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "プロジェクトの削除に失敗しました", 500);
  }
}
