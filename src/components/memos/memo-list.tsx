"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Send, Trash2, Pencil, Check, X, MessageCircle, UserPlus, CheckCheck } from "lucide-react";

interface MemoListProps {
  project: Record<string, unknown>;
}

function formatMemoDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isToday) return format(date, "HH:mm", { locale: ja });

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return `昨日 ${format(date, "HH:mm", { locale: ja })}`;

  return format(date, "M/d HH:mm", { locale: ja });
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isToday) return "今日";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return "昨日";

  return format(date, "M月d日（E）", { locale: ja });
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
    "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const MEMBERS_KEY = "memo-members";
const SELECTED_MEMBER_KEY = "memo-selected-member";

function loadMembers(): string[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(MEMBERS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveMembers(members: string[]) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function MemoList({ project }: MemoListProps) {
  const projectId = project.id as string;
  const [memos, setMemos] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // localStorage からメンバーリストと選択中メンバーを復元
  useEffect(() => {
    const m = loadMembers();
    setMembers(m);
    const saved = localStorage.getItem(SELECTED_MEMBER_KEY);
    if (saved && m.includes(saved)) {
      setSelectedMember(saved);
    }
  }, []);

  function handleSelectMember(name: string) {
    setSelectedMember(name);
    localStorage.setItem(SELECTED_MEMBER_KEY, name);
  }

  function handleAddMember() {
    const name = newMemberName.trim();
    if (!name || members.includes(name)) return;
    const updated = [...members, name];
    setMembers(updated);
    saveMembers(updated);
    setSelectedMember(name);
    localStorage.setItem(SELECTED_MEMBER_KEY, name);
    setNewMemberName("");
    setShowAddMember(false);
  }

  function handleRemoveMember(name: string) {
    const updated = members.filter((m) => m !== name);
    setMembers(updated);
    saveMembers(updated);
    if (selectedMember === name) {
      setSelectedMember(updated[0] || "");
      localStorage.setItem(SELECTED_MEMBER_KEY, updated[0] || "");
    }
  }

  async function fetchMemos() {
    try {
      const res = await fetch(`/api/projects/${projectId}/memos?type=MESSAGE`);
      if (!res.ok) { setLoading(false); return; }
      const result = await res.json();
      if (result.success) setMemos(result.data);
    } catch { /* */ }
    setLoading(false);
  }

  useEffect(() => {
    fetchMemos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [memos]);

  async function handleAdd() {
    if (!newContent.trim() || !selectedMember) return;
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}/memos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newContent,
        type: "MESSAGE",
        authorName: selectedMember,
      }),
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

  async function handleConfirm(memo: Record<string, unknown>) {
    if (!selectedMember) return;
    const currentConfirmed = (memo.confirmedBy as string[]) || [];
    const alreadyConfirmed = currentConfirmed.includes(selectedMember);
    const newConfirmed = alreadyConfirmed
      ? currentConfirmed.filter((n) => n !== selectedMember)
      : [...currentConfirmed, selectedMember];

    await fetch(`/api/projects/${projectId}/memos/${memo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedBy: newConfirmed }),
    });
    fetchMemos();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/projects/${projectId}/memos/${deleteTarget}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchMemos();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  }

  if (loading) {
    return <div className="text-muted-foreground p-4">読み込み中...</div>;
  }

  const sortedMemos = [...memos].reverse();
  const groupedMemos: { date: string; items: Record<string, unknown>[] }[] = [];
  for (const memo of sortedMemos) {
    const dateKey = format(new Date(memo.createdAt as string), "yyyy-MM-dd");
    const lastGroup = groupedMemos[groupedMemos.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.items.push(memo);
    } else {
      groupedMemos.push({ date: dateKey, items: [memo] });
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">連絡帳</h3>
          <span className="text-sm text-muted-foreground">({memos.length}件)</span>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
        {memos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">まだメッセージがありません</p>
          </div>
        ) : (
          groupedMemos.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t" />
                <span className="text-xs text-muted-foreground bg-background px-2">
                  {formatGroupDate(group.date)}
                </span>
                <div className="flex-1 border-t" />
              </div>
              <div className="space-y-3">
                {group.items.map((memo) => {
                  const authorName = (memo.authorName as string) || "不明";
                  const initial = authorName.charAt(0);
                  const avatarColor = getAvatarColor(authorName);
                  const confirmed = (memo.confirmedBy as string[]) || [];
                  const iConfirmed = selectedMember ? confirmed.includes(selectedMember) : false;

                  return (
                    <div key={memo.id as string} className="flex gap-2 group">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center text-sm font-medium`}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">{authorName}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatMemoDate(memo.createdAt as string)}
                          </span>
                        </div>

                        {editId === (memo.id as string) ? (
                          <div className="mt-1">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={3}
                              className="text-sm"
                              autoFocus
                            />
                            <div className="flex gap-1 mt-1">
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditId(null); setEditContent(""); }}>
                                <X className="mr-1 h-3 w-3" />取消
                              </Button>
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleUpdate(memo.id as string)} disabled={!editContent.trim()}>
                                <Check className="mr-1 h-3 w-3" />保存
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-0.5 bg-muted/60 rounded-lg rounded-tl-none px-3 py-2 inline-block max-w-full">
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {memo.content as string}
                            </p>
                          </div>
                        )}

                        {/* 確認済み表示 + アクションボタン */}
                        {editId !== (memo.id as string) && (
                          <div className="flex items-center gap-2 mt-1">
                            {/* 確認ボタン */}
                            {selectedMember && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 text-xs px-2 ${iConfirmed ? "text-green-600" : "text-muted-foreground"}`}
                                onClick={() => handleConfirm(memo)}
                              >
                                <CheckCheck className="mr-1 h-3 w-3" />
                                {iConfirmed ? "確認済" : "確認"}
                              </Button>
                            )}
                            {/* 確認者一覧 */}
                            {confirmed.length > 0 && (
                              <div className="flex items-center gap-1">
                                {confirmed.map((name) => (
                                  <Badge key={name} variant="outline" className="h-5 text-[10px] px-1.5 text-green-600 border-green-200">
                                    {name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {/* 編集・削除（ホバー表示） */}
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditId(memo.id as string); setEditContent(memo.content as string); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(memo.id as string)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t pt-3 mt-auto space-y-2">
        {/* メンバー選択 */}
        <div className="flex gap-2 items-center">
          {members.length > 0 ? (
            <Select value={selectedMember} onValueChange={handleSelectMember}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="名前を選択" />
              </SelectTrigger>
              <SelectContent>
                {members.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-muted-foreground">メンバーを追加してください</span>
          )}
          <span className="text-xs text-muted-foreground">として投稿</span>

          {showAddMember ? (
            <div className="flex gap-1 items-center ml-auto">
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="名前"
                className="w-24 h-7 text-sm"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleAddMember(); }}
              />
              <Button size="sm" variant="default" className="h-7 text-xs px-2" onClick={handleAddMember} disabled={!newMemberName.trim()}>
                追加
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => { setShowAddMember(false); setNewMemberName(""); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={() => setShowAddMember(true)}>
              <UserPlus className="mr-1 h-3 w-3" />
              メンバー追加
            </Button>
          )}
        </div>

        {/* メンバー一覧（削除可能） */}
        {members.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {members.map((name) => (
              <Badge
                key={name}
                variant={name === selectedMember ? "default" : "outline"}
                className="text-xs cursor-pointer gap-1"
                onClick={() => handleSelectMember(name)}
              >
                {name}
                <button
                  className="ml-0.5 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleRemoveMember(name); }}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* メッセージ入力 */}
        <div className="flex gap-2">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedMember ? "メッセージを入力... (Shift+Enterで改行)" : "先にメンバーを追加・選択してください"}
            rows={2}
            className="resize-none text-sm"
            disabled={!selectedMember}
          />
          <Button
            onClick={handleAdd}
            disabled={saving || !newContent.trim() || !selectedMember}
            size="icon"
            className="h-auto aspect-square self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="メッセージを削除"
        description="このメッセージを削除しますか？"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
