"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArtistForm } from "@/components/artists/artist-form";
import { useArtist } from "@/hooks/use-artists";
import { ArrowLeft } from "lucide-react";

export default function EditArtistPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = use(params);
  const { data, isLoading } = useArtist(artistId);
  const artist = data?.data;

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
          <Link href={`/artists/${artistId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">アーティスト編集</h1>
      </div>
      <ArtistForm artist={artist} />
    </div>
  );
}
