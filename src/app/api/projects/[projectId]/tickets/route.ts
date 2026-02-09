import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { ticketTypeSchema } from "@/schemas/ticket";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  try {
    const tickets = await prisma.ticketType.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    return apiResponse(tickets);
  } catch (e) {
    console.error("Ticket GET error:", e);
    return apiError("INTERNAL_ERROR", "チケットの取得に失敗しました", 500);
  }
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
    const parsed = ticketTypeSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const ticket = await prisma.ticketType.create({
      data: {
        projectId,
        name: parsed.data.name,
        price: parsed.data.price,
        quantity: parsed.data.quantity,
      },
    });

    // 予算に自動反映
    await syncTicketBudget(projectId);

    return apiResponse(ticket);
  } catch {
    return apiError("INTERNAL_ERROR", "チケットの作成に失敗しました", 500);
  }
}

async function syncTicketBudget(projectId: string) {
  const tickets = await prisma.ticketType.findMany({ where: { projectId } });
  const totalRevenue = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);

  // 既存のチケット予算項目を削除
  await prisma.budgetItem.deleteMany({
    where: {
      projectId,
      category: "チケット収入",
      description: "チケット売上（自動連携）",
    },
  });

  // 合計があれば予算項目を作成
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
