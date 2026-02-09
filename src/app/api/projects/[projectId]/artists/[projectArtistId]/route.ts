import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProjectArtistSchema = z.object({
  artistStatus: z.enum(["CANDIDATE", "OFFER_SENT", "AWAITING_REPLY", "CONFIRMED", "DECLINED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "INVOICED", "PAID", "ON_HOLD"]).optional(),
  guaranteeAmount: z.number().nullable().optional(),
  settlementMethod: z.enum(["BANK_TRANSFER", "CASH", "OTHER"]).nullable().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; projectArtistId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId, projectArtistId } = await params;

  try {
    const body = await request.json();
    const parsed = updateProjectArtistSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await prisma.projectArtist.findUnique({
      where: { id: projectArtistId },
      include: { artist: { select: { name: true } } },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "該当するレコードが見つかりません", 404);
    }

    // ステータス変更があれば履歴を記録
    const histories: Array<{
      projectArtistId: string;
      changedById: string;
      fieldName: string;
      oldValue: string;
      newValue: string;
    }> = [];

    if (parsed.data.artistStatus && parsed.data.artistStatus !== existing.artistStatus) {
      histories.push({
        projectArtistId,
        changedById: session.user?.id as string,
        fieldName: "artistStatus",
        oldValue: existing.artistStatus,
        newValue: parsed.data.artistStatus,
      });
    }

    if (parsed.data.paymentStatus && parsed.data.paymentStatus !== existing.paymentStatus) {
      histories.push({
        projectArtistId,
        changedById: session.user?.id as string,
        fieldName: "paymentStatus",
        oldValue: existing.paymentStatus,
        newValue: parsed.data.paymentStatus,
      });
    }

    // ギャランティ変更時に予算項目を自動同期
    const guaranteeChanged = parsed.data.guaranteeAmount !== undefined
      && parsed.data.guaranteeAmount !== existing.guaranteeAmount;

    const budgetCategory = `アーティスト: ${existing.artist.name}`;

    const [projectArtist] = await prisma.$transaction([
      prisma.projectArtist.update({
        where: { id: projectArtistId },
        data: parsed.data,
        include: {
          artist: true,
          statusHistories: {
            include: { changedBy: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      }),
      ...(histories.length > 0
        ? [prisma.statusHistory.createMany({ data: histories })]
        : []),
      // ギャランティ → 予算反映
      ...(guaranteeChanged
        ? [
            // 既存の自動生成予算項目を削除
            prisma.budgetItem.deleteMany({
              where: {
                projectId,
                category: budgetCategory,
                description: "ギャランティ（自動連携）",
              },
            }),
            // 新しい金額があれば予算項目を作成
            ...(parsed.data.guaranteeAmount
              ? [
                  prisma.budgetItem.create({
                    data: {
                      projectId,
                      type: "EXPENSE",
                      category: budgetCategory,
                      description: "ギャランティ（自動連携）",
                      amount: parsed.data.guaranteeAmount,
                      isEstimate: true,
                    },
                  }),
                ]
              : []),
          ]
        : []),
    ]);

    return apiResponse(projectArtist);
  } catch {
    return apiError("INTERNAL_ERROR", "更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; projectArtistId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectArtistId } = await params;

  try {
    await prisma.projectArtist.delete({
      where: { id: projectArtistId },
    });

    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "削除に失敗しました", 500);
  }
}
