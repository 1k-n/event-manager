"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArtistForm } from "@/components/artists/artist-form";
import { ArrowLeft } from "lucide-react";

export default function NewArtistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/artists">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">新規アーティスト</h1>
      </div>
      <ArtistForm />
    </div>
  );
}
