import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const [
    projectCounts,
    taskCounts,
    budgetAgg,
    recentProjects,
    upcomingProjects,
    artistCount,
  ] = await Promise.all([
    // プロジェクト ステータス別集計
    prisma.project.groupBy({
      by: ["status"],
      where: { isDeleted: false },
      _count: true,
    }),
    // タスク ステータス別集計
    prisma.task.groupBy({
      by: ["status"],
      _count: true,
    }),
    // 予算 タイプ別合計
    prisma.budgetItem.groupBy({
      by: ["type"],
      _sum: { amount: true },
    }),
    // 最近更新されたプロジェクト
    prisma.project.findMany({
      where: { isDeleted: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        eventDate: true,
        updatedAt: true,
        _count: { select: { projectArtists: true, tasks: true } },
      },
    }),
    // 今後のイベント
    prisma.project.findMany({
      where: {
        isDeleted: false,
        eventDate: { gte: new Date() },
      },
      orderBy: { eventDate: "asc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        eventDate: true,
        venueName: true,
      },
    }),
    // アーティスト数
    prisma.artist.count({ where: { isDeleted: false } }),
  ]);

  const projectsByStatus: Record<string, number> = {};
  for (const row of projectCounts) {
    projectsByStatus[row.status] = row._count;
  }

  const tasksByStatus: Record<string, number> = {};
  for (const row of taskCounts) {
    tasksByStatus[row.status] = row._count;
  }

  const budgetByType: Record<string, number> = {};
  for (const row of budgetAgg) {
    budgetByType[row.type] = row._sum.amount || 0;
  }

  return apiResponse({
    projects: {
      byStatus: projectsByStatus,
      total: Object.values(projectsByStatus).reduce((a, b) => a + b, 0),
    },
    tasks: {
      byStatus: tasksByStatus,
      total: Object.values(tasksByStatus).reduce((a, b) => a + b, 0),
    },
    budget: {
      income: budgetByType["INCOME"] || 0,
      expense: budgetByType["EXPENSE"] || 0,
      balance: (budgetByType["INCOME"] || 0) - (budgetByType["EXPENSE"] || 0),
    },
    artistCount,
    recentProjects,
    upcomingProjects,
  });
}
