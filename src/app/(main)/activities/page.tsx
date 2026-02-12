"use client";

import { useState } from "react";
import { useActivities } from "@/hooks/use-activities";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

const PAGE_SIZE = 50;

export default function ActivitiesPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useActivities(undefined, PAGE_SIZE, offset);
  const activities = data?.data?.activities || [];
  const total = data?.data?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-6 w-6" />
        <h1 className="text-2xl font-bold">アクティビティログ</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            操作履歴 ({total}件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              読み込み中...
            </p>
          ) : (
            <>
              <ActivityTimeline activities={activities} />
              {total > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  >
                    前へ
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {offset + 1} - {Math.min(offset + PAGE_SIZE, total)} / {total}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={offset + PAGE_SIZE >= total}
                    onClick={() => setOffset(offset + PAGE_SIZE)}
                  >
                    次へ
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
