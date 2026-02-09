"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/constants";
import { formatDate, isDueSoon, isOverdue } from "@/lib/format";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { Plus, Trash2, ListTodo, Pencil, CalendarDays, List } from "lucide-react";

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
};

interface TaskListProps {
  project: Record<string, unknown>;
  onUpdate: () => void;
}

export function TaskList({ project, onUpdate }: TaskListProps) {
  const tasks = (project.tasks as Record<string, unknown>[]) || [];
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  async function handleStatusToggle(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    await fetch(`/api/projects/${project.id}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/projects/${project.id}/tasks/${deleteTarget}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteTarget(null);
    onUpdate();
  }

  function handleEdit(task: Record<string, unknown>) {
    setEditTarget(task);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function renderTask(task: Record<string, unknown>) {
    const dueDate = task.dueDate as string | null;
    const assignee = task.assignee as Record<string, unknown> | null;
    const pa = task.projectArtist as Record<string, unknown> | null;
    const artist = pa?.artist as Record<string, unknown> | null;

    return (
      <div key={task.id as string} className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors">
        <Checkbox
          checked={task.status === "DONE"}
          onCheckedChange={() => handleStatusToggle(task.id as string, task.status as string)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
            {task.title as string}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge className={priorityColors[task.priority as string]} variant="secondary">
              {TASK_PRIORITY_LABELS[task.priority as string]}
            </Badge>
            <Badge className={statusColors[task.status as string]} variant="secondary">
              {TASK_STATUS_LABELS[task.status as string]}
            </Badge>
            {(assignee?.name as string) ? (
              <Badge variant="outline">{assignee?.name as string}</Badge>
            ) : null}
            {(artist?.name as string) ? (
              <Badge variant="outline">{artist?.name as string}</Badge>
            ) : null}
          </div>
          {dueDate ? (
            <div className={`text-xs mt-1 ${isOverdue(dueDate) ? "text-destructive font-medium" : isDueSoon(dueDate) ? "text-orange-600" : "text-muted-foreground"}`}>
              期限: {formatDate(dueDate)}
              {isOverdue(dueDate) && " (期限超過)"}
              {isDueSoon(dueDate) && " (まもなく)"}
            </div>
          ) : null}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(task.id as string)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">タスク ({tasks.length})</h3>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            追加
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>タスクがまだ作成されていません</p>
            <Button variant="outline" className="mt-4" onClick={handleAdd}>
              タスクを追加
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "calendar" ? (
        <TaskCalendar tasks={tasks} onTaskClick={handleEdit} />
      ) : (
        <div className="space-y-4">
          {todoTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">未着手 ({todoTasks.length})</h4>
              <div className="space-y-1">{todoTasks.map(renderTask)}</div>
            </div>
          )}
          {inProgressTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">進行中 ({inProgressTasks.length})</h4>
              <div className="space-y-1">{inProgressTasks.map(renderTask)}</div>
            </div>
          )}
          {doneTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">完了 ({doneTasks.length})</h4>
              <div className="space-y-1">{doneTasks.map(renderTask)}</div>
            </div>
          )}
        </div>
      )}

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={project.id as string}
        projectArtists={(project.projectArtists as Record<string, unknown>[]) || []}
        task={editTarget}
        onSaved={onUpdate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="タスクを削除"
        description="このタスクを削除しますか？"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  projectArtists,
  task,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectArtists: Record<string, unknown>[];
  task: Record<string, unknown> | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState((task?.status as string) || "TODO");
  const [priority, setPriority] = useState((task?.priority as string) || "MEDIUM");
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
  const isEdit = !!task;

  function getDueDateValue() {
    if (!task?.dueDate) return "";
    return new Date(task.dueDate as string).toISOString().split("T")[0];
  }

  function toggleArtist(paId: string) {
    setSelectedArtistIds((prev) =>
      prev.includes(paId) ? prev.filter((id) => id !== paId) : [...prev, paId]
    );
  }

  function selectAllArtists() {
    if (selectedArtistIds.length === projectArtists.length) {
      setSelectedArtistIds([]);
    } else {
      setSelectedArtistIds(projectArtists.map((pa) => pa.id as string));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const base = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      priority,
      status,
      dueDate: formData.get("dueDate") as string || undefined,
    };

    if (isEdit) {
      // 編集時は1件更新
      const data = {
        ...base,
        projectArtistId: formData.get("projectArtistId") as string || undefined,
      };
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setSaving(false);
      if (!result.success) {
        setError(result.error?.message || "保存に失敗しました");
        return;
      }
    } else {
      // 新規作成
      const data =
        selectedArtistIds.length > 0
          ? { ...base, projectArtistIds: selectedArtistIds }
          : { ...base };

      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setSaving(false);
      if (!result.success) {
        setError(result.error?.message || "保存に失敗しました");
        return;
      }
    }

    setSelectedArtistIds([]);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v && task) { setStatus(task.status as string); setPriority(task.priority as string); setSelectedArtistIds([]); } if (v && !task) { setStatus("TODO"); setPriority("MEDIUM"); setSelectedArtistIds([]); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "タスク編集" : "タスク追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input id="title" name="title" defaultValue={(task?.title as string) || ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea id="description" name="description" defaultValue={(task?.description as string) || ""} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>優先度</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ステータス</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">期限</Label>
            <Input id="dueDate" name="dueDate" type="date" defaultValue={getDueDateValue()} />
          </div>

          {/* アーティスト選択 */}
          {isEdit ? (
            <div className="space-y-2">
              <Label>関連アーティスト</Label>
              <select name="projectArtistId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" defaultValue={(task?.projectArtistId as string) || ""}>
                <option value="">なし</option>
                {projectArtists.map((pa) => {
                  const artist = pa.artist as Record<string, unknown>;
                  return (
                    <option key={pa.id as string} value={pa.id as string}>
                      {artist.name as string}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : projectArtists.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>対象アーティスト（複数選択可）</Label>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={selectAllArtists}>
                  {selectedArtistIds.length === projectArtists.length ? "全解除" : "全選択"}
                </Button>
              </div>
              <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                {projectArtists.map((pa) => {
                  const artist = pa.artist as Record<string, unknown>;
                  const paId = pa.id as string;
                  const checked = selectedArtistIds.includes(paId);
                  return (
                    <label
                      key={paId}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted transition-colors ${checked ? "bg-primary/5" : ""}`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleArtist(paId)}
                      />
                      <span className="text-sm">{artist.name as string}</span>
                    </label>
                  );
                })}
              </div>
              {selectedArtistIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedArtistIds.length}名のアーティストに対してタスクが作成されます
                </p>
              )}
            </div>
          ) : null}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "保存中..."
                : isEdit
                ? "更新"
                : selectedArtistIds.length > 1
                ? `${selectedArtistIds.length}件追加`
                : "追加"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
