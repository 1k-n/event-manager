"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useArtists } from "@/hooks/use-artists";
import { Plus, Search, Music, Mail, Phone } from "lucide-react";

export default function ArtistsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useArtists(search);
  const artists = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">アーティスト</h1>
        <Button asChild>
          <Link href="/artists/new">
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="アーティスト名・メールで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">読み込み中...</div>
      ) : artists.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "該当するアーティストが見つかりません" : "アーティストがまだ登録されていません"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist: Record<string, unknown>) => (
            <Link key={artist.id as string} href={`/artists/${artist.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{artist.name as string}</h3>
                      {(artist.email as string) ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{artist.email as string}</span>
                        </div>
                      ) : null}
                      {(artist.phone as string) ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{artist.phone as string}</span>
                        </div>
                      ) : null}
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {(artist._count as Record<string, number>)?.projectArtists || 0} プロジェクト
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
