import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { memoSchema } from "@/schemas/memo";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memoId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { memoId } = await params;

  try {
    const body = await request.json();
    const parsed = memoSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    // 確認者の追加/削除
    const body_confirmedBy = body.confirmedBy as string[] | undefined;

    const memo = await prisma.projectMemo.update({
      where: { id: memoId },
      data: {
        ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
        ...(parsed.data.authorName !== undefined ? { authorName: parsed.data.authorName } : {}),
        ...(body_confirmedBy !== undefined ? { confirmedBy: body_confirmedBy } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return apiResponse(memo);
  } catch {
    return apiError("INTERNAL_ERROR", "メモの更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memoId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { memoId } = await params;

  try {
    await prisma.projectMemo.delete({ where: { id: memoId } });
    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "メモの削除に失敗しました", 500);
  }
}
