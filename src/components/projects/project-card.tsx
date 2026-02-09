"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    eventDate?: string | null;
    venueName?: string | null;
    status: string;
    _count?: {
      projectArtists: number;
      tasks: number;
    };
  };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge className={statusColors[project.status] || ""} variant="secondary">
              {PROJECT_STATUS_LABELS[project.status] || project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {project.eventDate && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(project.eventDate)}
              </div>
            )}
            {project.venueName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {project.venueName}
              </div>
            )}
            {project._count && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                アーティスト {project._count.projectArtists}名
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
