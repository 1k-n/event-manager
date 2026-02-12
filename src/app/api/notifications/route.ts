import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { markNotificationsReadSchema } from "@/schemas/notification";

export async function GET() {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const userId = session.user?.id as string;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return apiResponse({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const userId = session.user?.id as string;

  try {
    const body = await request.json();
    const parsed = markNotificationsReadSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    if (parsed.data.markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (parsed.data.notificationIds && parsed.data.notificationIds.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: parsed.data.notificationIds },
          userId,
        },
        data: { isRead: true },
      });
    }

    return apiResponse({ success: true });
  } catch {
    return apiError("INTERNAL_ERROR", "通知の更新に失敗しました", 500);
  }
}
