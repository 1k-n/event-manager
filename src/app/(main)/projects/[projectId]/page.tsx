"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useProject } from "@/hooks/use-projects";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data, isLoading, mutate } = useProject(projectId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const project = data?.data;

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteOpen(false);
    router.push("/projects");
  }

  if (isLoading) {
    return <div className="text-muted-foreground">読み込み中...</div>;
  }

  if (!project) {
    return <div className="text-muted-foreground">プロジェクトが見つかりません</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{project.name}</h1>
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            編集
          </Link>
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          削除
        </Button>
      </div>

      <ProjectTabs project={project} onUpdate={() => mutate()} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="プロジェクトを削除"
        description="このプロジェクトを削除しますか？この操作は取り消せません。"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
