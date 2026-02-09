"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { formatDate } from "@/lib/format";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

interface ProjectOverviewProps {
  project: Record<string, unknown>;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">ステータス</span>
            <div className="mt-1">
              <Badge className={statusColors[project.status as string] || ""} variant="secondary">
                {PROJECT_STATUS_LABELS[project.status as string] || (project.status as string)}
              </Badge>
            </div>
          </div>
          {(project.description as string) ? (
            <div>
              <span className="text-sm text-muted-foreground">説明</span>
              <p className="mt-1 text-sm">{project.description as string}</p>
            </div>
          ) : null}
          {(project.eventDate as string) ? (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(project.eventDate as string)}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">会場情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(project.venueName as string) ? (
            <>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{project.venueName as string}</span>
              </div>
              {(project.venueAddress as string) ? (
                <p className="text-sm text-muted-foreground ml-6">
                  {project.venueAddress as string}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">会場情報が未設定です</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
