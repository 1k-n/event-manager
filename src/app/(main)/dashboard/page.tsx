"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PROJECT_STATUS_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { formatDate, formatRelative } from "@/lib/format";
import {
  FolderOpen,
  Users,
  CheckSquare,
  Wallet,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher);
  const dashboard = data?.data;

  if (isLoading) {
    return <div className="text-muted-foreground">読み込み中...</div>;
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <LayoutDashboard className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>データの読み込みに失敗しました</p>
      </div>
    );
  }

  const { projects, tasks, budget, artistCount, recentProjects, upcomingProjects } = dashboard;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              プロジェクト
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              進行中: {projects.byStatus?.ACTIVE || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              アーティスト
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artistCount}</div>
            <p className="text-xs text-muted-foreground mt-1">登録済み</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              タスク
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              未完了: {(tasks.byStatus?.TODO || 0) + (tasks.byStatus?.IN_PROGRESS || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              収支
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budget.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(budget.balance)}
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                {formatCurrency(budget.income)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-600" />
                {formatCurrency(budget.expense)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タスク進捗 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">タスク進捗</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.total === 0 ? (
            <p className="text-sm text-muted-foreground">タスクはまだありません</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => {
                const count = tasks.byStatus?.[key] || 0;
                const pct = tasks.total > 0 ? Math.round((count / tasks.total) * 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">
                        {count}件 ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          key === "DONE"
                            ? "bg-green-500"
                            : key === "IN_PROGRESS"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近のプロジェクト */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">最近のプロジェクト</CardTitle>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                すべて表示
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">プロジェクトはまだありません</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p: Record<string, unknown>) => (
                  <Link
                    key={p.id as string}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{p.name as string}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>更新: {formatRelative(p.updatedAt as string)}</span>
                        {(p._count as Record<string, number>)?.tasks > 0 && (
                          <span>タスク: {(p._count as Record<string, number>).tasks}</span>
                        )}
                      </div>
                    </div>
                    <Badge className={statusColors[p.status as string]} variant="secondary">
                      {PROJECT_STATUS_LABELS[p.status as string]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 今後のイベント */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">今後のイベント</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">予定されているイベントはありません</p>
            ) : (
              <div className="space-y-3">
                {upcomingProjects.map((p: Record<string, unknown>) => (
                  <Link
                    key={p.id as string}
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{p.name as string}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.eventDate as string)}
                        {(p.venueName as string) ? ` / ${p.venueName as string}` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* プロジェクトステータス */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">プロジェクト状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{projects.byStatus?.[key] || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
