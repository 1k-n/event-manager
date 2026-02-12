import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function createNotifications(
  notifications: CreateNotificationParams[]
): Promise<void> {
  try {
    await prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link || null,
      })),
    });
  } catch (error) {
    console.error("Failed to create notifications:", error);
  }
}

export async function getAdminAndStaffUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    select: { id: true },
  });
  return users.map((u) => u.id);
}
