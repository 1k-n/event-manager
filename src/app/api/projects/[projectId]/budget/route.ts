import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { budgetItemSchema } from "@/schemas/budget";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  const items = await prisma.budgetItem.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(items);
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
    const parsed = budgetItemSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const item = await prisma.budgetItem.create({
      data: {
        projectId,
        type: parsed.data.type,
        category: parsed.data.category,
        description: parsed.data.description || null,
        amount: parsed.data.amount,
        isEstimate: parsed.data.isEstimate,
      },
    });

    await logActivity({
      userId: session.user?.id as string,
      action: "CREATE",
      entityType: "BUDGET_ITEM",
      entityId: item.id,
      projectId,
      description: `予算項目「${item.category}」を作成しました`,
    });

    return apiResponse(item);
  } catch {
    return apiError("INTERNAL_ERROR", "予算項目の作成に失敗しました", 500);
  }
}
