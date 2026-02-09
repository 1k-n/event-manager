"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatRelative } from "@/lib/format";
import { Plus, Trash2, Pencil, StickyNote, Check, X } from "lucide-react";

interface NoteListProps {
  project: Record<string, unknown>;
}

export function NoteList({ project }: NoteListProps) {
  const projectId = project.id as string;
  const [memos, setMemos] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchMemos() {
    try {
      const res = await fetch(`/api/projects/${projectId}/memos?type=MEMO`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const result = await res.json();
      if (result.success) {
        setMemos(result.data);
      }
    } catch {
      // fetch error
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMemos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleAdd() {
    if (!newContent.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}/memos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent, type: "MEMO" }),
    });
    const result = await res.json();
    setSaving(false);
    if (result.success) {
      setNewContent("");
      fetchMemos();
    }
  }

  async function handleUpdate(memoId: string) {
    if (!editContent.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/memos/${memoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    const result = await res.json();
    if (result.success) {
      setEditId(null);
      setEditContent("");
      fetchMemos();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/projects/${projectId}/memos/${deleteTarget}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteTarget(null);
    fetchMemos();
  }

  if (loading) {
    return <div className="text-muted-foreground p-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StickyNote className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">メモ</h3>
        <span className="text-sm text-muted-foreground">({memos.length}件)</span>
      </div>

      {/* 新規メモ入力 */}
      <Card>
        <CardContent className="pt-4">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="メモを入力..."
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={saving || !newContent.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {saving ? "追加中..." : "メモを追加"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* メモ一覧 */}
      {memos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>メモがまだありません</p>
            <p className="text-xs mt-1">作業メモやアイデアを自由に書き留めましょう</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {memos.map((memo) => (
            <Card key={memo.id as string} className="bg-yellow-50/50 dark:bg-yellow-950/10 border-yellow-200/50">
              <CardContent className="pt-4">
                {editId === (memo.id as string) ? (
                  <div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-1 justify-end mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditId(null); setEditContent(""); }}
                      >
                        <X className="mr-1 h-4 w-4" />
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(memo.id as string)}
                        disabled={!editContent.trim()}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <pre className="whitespace-pre-wrap text-sm break-words">
                      {memo.content as string}
                    </pre>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-yellow-200/50">
                      <div className="text-xs text-muted-foreground">
                        {formatRelative(memo.createdAt as string)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditId(memo.id as string);
                            setEditContent(memo.content as string);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(memo.id as string)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="メモを削除"
        description="このメモを削除しますか？"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
