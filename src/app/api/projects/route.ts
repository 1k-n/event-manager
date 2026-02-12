import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { projectSchema } from "@/schemas/project";
import { logActivity } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "eventDate";
  const order = searchParams.get("order") || "asc";

  const projects = await prisma.project.findMany({
    where: {
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { venueName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: {
          projectArtists: true,
          tasks: true,
        },
      },
    },
    orderBy: { [sort]: order },
  });

  return apiResponse(projects);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
        venueName: parsed.data.venueName || null,
        venueAddress: parsed.data.venueAddress || null,
        status: parsed.data.status || "DRAFT",
      },
    });

    await logActivity({
      userId: session.user?.id as string,
      action: "CREATE",
      entityType: "PROJECT",
      entityId: project.id,
      projectId: project.id,
      description: `プロジェクト「${project.name}」を作成しました`,
    });

    return apiResponse(project);
  } catch {
    return apiError("INTERNAL_ERROR", "プロジェクトの作成に失敗しました", 500);
  }
}
