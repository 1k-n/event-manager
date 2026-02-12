import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: projectId ? { projectId } : {},
      include: {
        user: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.activityLog.count({
      where: projectId ? { projectId } : {},
    }),
  ]);

  return apiResponse({ activities, total });
}
