import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { notificationId } = await params;
  const userId = session.user?.id as string;

  try {
    await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });

    return apiResponse({ success: true });
  } catch {
    return apiError("INTERNAL_ERROR", "通知の更新に失敗しました", 500);
  }
}
