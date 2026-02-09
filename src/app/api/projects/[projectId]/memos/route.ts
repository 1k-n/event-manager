import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { memoSchema } from "@/schemas/memo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;

  try {
    const memos = await prisma.projectMemo.findMany({
      where: {
        projectId,
        ...(type === "MEMO" || type === "MESSAGE" ? { type } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(memos);
  } catch (e) {
    console.error("Memo GET error:", e);
    return apiError("INTERNAL_ERROR", "メモの取得に失敗しました", 500);
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
    const parsed = memoSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const memo = await prisma.projectMemo.create({
      data: {
        projectId,
        type: parsed.data.type,
        content: parsed.data.content,
        authorName: parsed.data.authorName || null,
        createdById: session.user?.id as string,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return apiResponse(memo);
  } catch {
    return apiError("INTERNAL_ERROR", "メモの作成に失敗しました", 500);
  }
}
