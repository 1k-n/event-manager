import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { budgetItemSchema } from "@/schemas/budget";
import { logActivity } from "@/lib/activity-logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; itemId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId, itemId } = await params;

  try {
    const body = await request.json();
    const parsed = budgetItemSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const item = await prisma.budgetItem.update({
      where: { id: itemId },
      data: parsed.data,
    });

    await logActivity({
      userId: session.user?.id as string,
      action: "UPDATE",
      entityType: "BUDGET_ITEM",
      entityId: itemId,
      projectId,
      description: `予算項目「${item.category}」を更新しました`,
    });

    return apiResponse(item);
  } catch {
    return apiError("INTERNAL_ERROR", "予算項目の更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; itemId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId, itemId } = await params;

  try {
    const item = await prisma.budgetItem.findUnique({
      where: { id: itemId },
      select: { category: true },
    });

    await prisma.budgetItem.delete({ where: { id: itemId } });

    await logActivity({
      userId: session.user?.id as string,
      action: "DELETE",
      entityType: "BUDGET_ITEM",
      entityId: itemId,
      projectId,
      description: `予算項目「${item?.category || "不明"}」を削除しました`,
    });

    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "予算項目の削除に失敗しました", 500);
  }
}
