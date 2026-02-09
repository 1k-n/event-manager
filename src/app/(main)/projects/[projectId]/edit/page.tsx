"use client";

import { use } from "react";
import { ProjectForm } from "@/components/projects/project-form";
import { useProject } from "@/hooks/use-projects";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data, isLoading } = useProject(projectId);
  const project = data?.data;

  if (isLoading) {
    return <div className="text-muted-foreground">読み込み中...</div>;
  }

  if (!project) {
    return <div className="text-muted-foreground">プロジェクトが見つかりません</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProjectForm project={project} />
    </div>
  );
}
