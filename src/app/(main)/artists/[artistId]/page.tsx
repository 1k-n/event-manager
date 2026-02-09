"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ArtistFileList } from "@/components/artists/artist-file-list";
import { useArtist } from "@/hooks/use-artists";
import { ARTIST_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Pencil, Trash2, ArrowLeft, Mail, Phone, Music, Banknote } from "lucide-react";

export default function ArtistDetailPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = use(params);
  const router = useRouter();
  const { data, isLoading } = useArtist(artistId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const artist = data?.data;

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/artists/${artistId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteOpen(false);
    router.push("/artists");
  }

  if (isLoading) {
    return <div className="text-muted-foreground">読み込み中...</div>;
  }

  if (!artist) {
    return <div className="text-muted-foreground">アーティストが見つかりません</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/artists">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{artist.name}</h1>
        <Button variant="outline" asChild>
          <Link href={`/artists/${artistId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            編集
          </Link>
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          削除
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {artist.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{artist.email}</span>
              </div>
            )}
            {artist.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{artist.phone}</span>
              </div>
            )}
            {artist.equipment && (
              <div className="flex items-center gap-2 text-sm">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span>{artist.equipment}</span>
              </div>
            )}
            {artist.bankInfo && (
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <span>{artist.bankInfo}</span>
              </div>
            )}
            {artist.notes && (
              <div className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
                {artist.notes}
              </div>
            )}
            {!artist.email && !artist.phone && !artist.equipment && !artist.bankInfo && !artist.notes && (
              <div className="text-sm text-muted-foreground">詳細情報なし</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">参加プロジェクト</CardTitle>
          </CardHeader>
          <CardContent>
            {artist.projectArtists && artist.projectArtists.length > 0 ? (
              <div className="space-y-3">
                {artist.projectArtists.map((pa: Record<string, unknown>) => {
                  const project = pa.project as Record<string, unknown>;
                  return (
                    <Link
                      key={pa.id as string}
                      href={`/projects/${project.id}`}
                      className="block p-3 rounded-md border hover:bg-muted transition-colors"
                    >
                      <div className="font-medium">{project.name as string}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">
                          {ARTIST_STATUS_LABELS[pa.artistStatus as string] || (pa.artistStatus as string)}
                        </Badge>
                        <Badge variant="secondary">
                          {PAYMENT_STATUS_LABELS[pa.paymentStatus as string] || (pa.paymentStatus as string)}
                        </Badge>
                      </div>
                      {(project.eventDate as string) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(project.eventDate as string)}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">まだプロジェクトに参加していません</div>
            )}
          </CardContent>
        </Card>
      </div>

      <ArtistFileList artistId={artistId} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="アーティストを削除"
        description="このアーティストを削除しますか？この操作は取り消せません。"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
