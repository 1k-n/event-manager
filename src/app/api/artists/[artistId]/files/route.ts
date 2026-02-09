import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { put } from "@vercel/blob";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { artistId } = await params;

  const files = await prisma.artistFile.findMany({
    where: { artistId },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(files);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { artistId } = await params;

  try {
    const artist = await prisma.artist.findUnique({
      where: { id: artistId, isDeleted: false },
    });

    if (!artist) {
      return apiError("NOT_FOUND", "アーティストが見つかりません", 404);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return apiError("NO_FILE", "ファイルが選択されていません");
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("FILE_TOO_LARGE", "ファイルサイズは10MB以下にしてください");
    }

    const blob = await put(file.name, file, { access: "public" });

    const artistFile = await prisma.artistFile.create({
      data: {
        artistId,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return apiResponse(artistFile);
  } catch {
    return apiError("INTERNAL_ERROR", "ファイルのアップロードに失敗しました", 500);
  }
}
