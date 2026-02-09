import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { ticketTypeSchema } from "@/schemas/ticket";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; ticketId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId, ticketId } = await params;

  try {
    const body = await request.json();
    const parsed = ticketTypeSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const ticket = await prisma.ticketType.update({
      where: { id: ticketId },
      data: parsed.data,
    });

    // 予算に自動反映
    await syncTicketBudget(projectId);

    return apiResponse(ticket);
  } catch {
    return apiError("INTERNAL_ERROR", "チケットの更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; ticketId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId, ticketId } = await params;

  try {
    await prisma.ticketType.delete({ where: { id: ticketId } });
    await syncTicketBudget(projectId);
    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "チケットの削除に失敗しました", 500);
  }
}

async function syncTicketBudget(projectId: string) {
  const tickets = await prisma.ticketType.findMany({ where: { projectId } });
  const totalRevenue = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);

  await prisma.budgetItem.deleteMany({
    where: {
      projectId,
      category: "チケット収入",
      description: "チケット売上（自動連携）",
    },
  });

  if (totalRevenue > 0) {
    await prisma.budgetItem.create({
      data: {
        projectId,
        type: "INCOME",
        category: "チケット収入",
        description: "チケット売上（自動連携）",
        amount: totalRevenue,
        isEstimate: true,
      },
    });
  }
}
