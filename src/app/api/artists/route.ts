import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { artistSchema } from "@/schemas/artist";
import { logActivity } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const artists = await prisma.artist.findMany({
    where: {
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: { projectArtists: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return apiResponse(artists);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  try {
    const body = await request.json();
    const parsed = artistSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const artist = await prisma.artist.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        equipment: parsed.data.equipment || null,
        bankInfo: parsed.data.bankInfo || null,
        notes: parsed.data.notes || null,
      },
    });

    await logActivity({
      userId: session.user?.id as string,
      action: "CREATE",
      entityType: "ARTIST",
      entityId: artist.id,
      description: `アーティスト「${artist.name}」を作成しました`,
    });

    return apiResponse(artist);
  } catch {
    return apiError("INTERNAL_ERROR", "アーティストの作成に失敗しました", 500);
  }
}
