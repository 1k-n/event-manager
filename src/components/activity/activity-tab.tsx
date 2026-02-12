"use client";

import { useActivities } from "@/hooks/use-activities";
import { ActivityTimeline } from "./activity-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityTabProps {
  projectId: string;
}

export function ActivityTab({ projectId }: ActivityTabProps) {
  const { data, isLoading } = useActivities(projectId);
  const activities = data?.data?.activities || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground text-center">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティビティ</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityTimeline activities={activities} showProject={false} />
      </CardContent>
    </Card>
  );
}
