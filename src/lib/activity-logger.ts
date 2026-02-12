import "server-only";
import { prisma } from "@/lib/prisma";
import type { ActivityAction, ActivityEntity, Prisma } from "@/generated/prisma/client";

interface LogActivityParams {
  userId: string;
  action: ActivityAction;
  entityType: ActivityEntity;
  entityId: string;
  projectId?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        projectId: params.projectId || null,
        description: params.description,
        metadata: (params.metadata as Prisma.InputJsonValue) || undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
