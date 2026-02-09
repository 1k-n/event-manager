import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
  name: z.string().min(1, "名前を入力してください").optional(),
  email: z.email("有効なメールアドレスを入力してください").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newPassword: z.string().min(6, "パスワードは6文字以上にしてください"),
});

export async function GET() {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) return apiError("NOT_FOUND", "ユーザーが見つかりません", 404);

  return apiResponse(user);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  try {
    const body = await request.json();
    const userId = session.user?.id as string;

    // パスワード変更
    if (body.currentPassword || body.newPassword) {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { hashedPassword: true },
      });

      if (!user?.hashedPassword) {
        return apiError("VALIDATION_ERROR", "パスワードが設定されていません");
      }

      const valid = await bcrypt.compare(parsed.data.currentPassword, user.hashedPassword);
      if (!valid) {
        return apiError("VALIDATION_ERROR", "現在のパスワードが正しくありません");
      }

      const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { hashedPassword },
      });

      return apiResponse({ updated: true });
    }

    // プロフィール更新
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    if (parsed.data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: parsed.data.email, NOT: { id: userId } },
      });
      if (existing) {
        return apiError("VALIDATION_ERROR", "このメールアドレスは既に使用されています");
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return apiResponse(updated);
  } catch {
    return apiError("INTERNAL_ERROR", "設定の更新に失敗しました", 500);
  }
}
