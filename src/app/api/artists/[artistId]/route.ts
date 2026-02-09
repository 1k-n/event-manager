import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { artistSchema } from "@/schemas/artist";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { artistId } = await params;

  const artist = await prisma.artist.findUnique({
    where: { id: artistId, isDeleted: false },
    include: {
      projectArtists: {
        include: {
          project: { select: { id: true, name: true, eventDate: true, status: true } },
        },
      },
    },
  });

  if (!artist) {
    return apiError("NOT_FOUND", "アーティストが見つかりません", 404);
  }

  return apiResponse(artist);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { artistId } = await params;

  try {
    const body = await request.json();
    const parsed = artistSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const artist = await prisma.artist.update({
      where: { id: artistId },
      data: parsed.data,
    });

    return apiResponse(artist);
  } catch {
    return apiError("INTERNAL_ERROR", "アーティストの更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { artistId } = await params;

  try {
    await prisma.artist.update({
      where: { id: artistId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "アーティストの削除に失敗しました", 500);
  }
}
