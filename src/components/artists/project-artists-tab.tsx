"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useArtists } from "@/hooks/use-artists";
import {
  ARTIST_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SETTLEMENT_METHOD_LABELS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, UserPlus, Search, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { EmailComposeDialog } from "@/components/artists/email-compose-dialog";

const artistStatusColors: Record<string, string> = {
  CANDIDATE: "bg-gray-100 text-gray-800",
  OFFER_SENT: "bg-blue-100 text-blue-800",
  AWAITING_REPLY: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: "bg-gray-100 text-gray-800",
  INVOICED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
};

interface ProjectArtistsTabProps {
  project: Record<string, unknown>;
  onUpdate: () => void;
}

export function ProjectArtistsTab({ project, onUpdate }: ProjectArtistsTabProps) {
  const projectArtists = (project.projectArtists as Record<string, unknown>[]) || [];
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [emailTarget, setEmailTarget] = useState<Record<string, unknown> | null>(null);

  async function handleStatusChange(
    projectArtistId: string,
    field: string,
    value: string
  ) {
    setUpdating(projectArtistId);
    await fetch(
      `/api/projects/${project.id}/artists/${projectArtistId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      }
    );
    setUpdating(null);
    onUpdate();
  }

  async function handleGuaranteeChange(
    projectArtistId: string,
    amount: string
  ) {
    const value = amount ? parseInt(amount, 10) : null;
    await fetch(
      `/api/projects/${project.id}/artists/${projectArtistId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guaranteeAmount: value }),
      }
    );
    onUpdate();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(
      `/api/projects/${project.id}/artists/${deleteTarget}`,
      { method: "DELETE" }
    );
    setDeleting(false);
    setDeleteTarget(null);
    onUpdate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          アーティスト ({projectArtists.length})
        </h3>
        <Button onClick={() => setAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          追加
        </Button>
      </div>

      {projectArtists.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>アーティストがまだ追加されていません</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setAddDialogOpen(true)}
            >
              アーティストを追加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projectArtists.map((pa) => {
            const artist = pa.artist as Record<string, unknown>;
            return (
              <Card key={pa.id as string}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/artists/${artist.id}`}
                        className="font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        {artist.name as string}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      {(artist.email as string) ? (
                        <p className="text-sm text-muted-foreground">
                          {artist.email as string}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEmailTarget(pa)}
                        title="メール作成"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(pa.id as string)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        ステータス
                      </Label>
                      <Select
                        value={pa.artistStatus as string}
                        onValueChange={(v) =>
                          handleStatusChange(pa.id as string, "artistStatus", v)
                        }
                        disabled={updating === (pa.id as string)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ARTIST_STATUS_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        支払いステータス
                      </Label>
                      <Select
                        value={pa.paymentStatus as string}
                        onValueChange={(v) =>
                          handleStatusChange(
                            pa.id as string,
                            "paymentStatus",
                            v
                          )
                        }
                        disabled={updating === (pa.id as string)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAYMENT_STATUS_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        ギャランティ
                      </Label>
                      <Input
                        type="number"
                        className="h-8"
                        defaultValue={
                          (pa.guaranteeAmount as number) || ""
                        }
                        placeholder="金額"
                        onBlur={(e) =>
                          handleGuaranteeChange(
                            pa.id as string,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        精算方法
                      </Label>
                      <Select
                        value={(pa.settlementMethod as string) || ""}
                        onValueChange={(v) =>
                          handleStatusChange(
                            pa.id as string,
                            "settlementMethod",
                            v
                          )
                        }
                        disabled={updating === (pa.id as string)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="未設定" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SETTLEMENT_METHOD_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(pa.guaranteeAmount as number) ? (
                    <div className="mt-2 text-sm text-muted-foreground">
                      ギャランティ: {formatCurrency(pa.guaranteeAmount as number)}
                    </div>
                  ) : null}

                  {/* ステータス履歴 */}
                  {((pa.statusHistories as Record<string, unknown>[])?.length ?? 0) > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">変更履歴</p>
                      <div className="space-y-1">
                        {((pa.statusHistories as Record<string, unknown>[]) || [])
                          .slice(0, 3)
                          .map((h) => (
                            <div key={h.id as string} className="text-xs text-muted-foreground">
                              {h.fieldName === "artistStatus"
                                ? `ステータス: ${ARTIST_STATUS_LABELS[h.oldValue as string] || h.oldValue} → ${ARTIST_STATUS_LABELS[h.newValue as string] || h.newValue}`
                                : `支払い: ${PAYMENT_STATUS_LABELS[h.oldValue as string] || h.oldValue} → ${PAYMENT_STATUS_LABELS[h.newValue as string] || h.newValue}`}
                              {" "}
                              ({(h.changedBy as Record<string, unknown>)?.name as string || "不明"})
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddArtistDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={project.id as string}
        existingArtistIds={projectArtists.map(
          (pa) => (pa.artist as Record<string, unknown>).id as string
        )}
        onAdded={onUpdate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="アーティストを削除"
        description="このアーティストをプロジェクトから削除しますか？"
        onConfirm={handleDelete}
        loading={deleting}
      />

      {emailTarget && (
        <EmailComposeDialog
          open={!!emailTarget}
          onOpenChange={(open) => !open && setEmailTarget(null)}
          project={project}
          artist={emailTarget.artist as Record<string, unknown>}
          projectArtist={emailTarget}
        />
      )}
    </div>
  );
}

function AddArtistDialog({
  open,
  onOpenChange,
  projectId,
  existingArtistIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existingArtistIds: string[];
  onAdded: () => void;
}) {
  const [search, setSearch] = useState("");
  const { data } = useArtists(search);
  const artists = (data?.data || []).filter(
    (a: Record<string, unknown>) => !existingArtistIds.includes(a.id as string)
  );
  const [adding, setAdding] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function handleAdd() {
    if (!selectedId) return;
    setAdding(true);
    const res = await fetch(`/api/projects/${projectId}/artists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artistId: selectedId,
        notes: notes || undefined,
      }),
    });
    const result = await res.json();
    setAdding(false);

    if (result.success) {
      setSelectedId(null);
      setNotes("");
      setSearch("");
      onOpenChange(false);
      onAdded();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>アーティストを追加</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="アーティスト名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
            {artists.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">
                {search ? "見つかりません" : "追加可能なアーティストがいません"}
              </div>
            ) : (
              artists.map((artist: Record<string, unknown>) => (
                <button
                  key={artist.id as string}
                  type="button"
                  className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                    selectedId === artist.id ? "bg-primary/10" : ""
                  }`}
                  onClick={() => setSelectedId(artist.id as string)}
                >
                  <div className="font-medium text-sm">{artist.name as string}</div>
                  {(artist.email as string) ? (
                    <div className="text-xs text-muted-foreground">
                      {artist.email as string}
                    </div>
                  ) : null}
                </button>
              ))
            )}
          </div>

          {selectedId && (
            <div className="space-y-2">
              <Label>備考（任意）</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="メモや備考を入力..."
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAdd} disabled={!selectedId || adding}>
              {adding ? "追加中..." : "追加"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
