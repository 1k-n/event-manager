import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { z } from "zod";

const addArtistSchema = z.object({
  artistId: z.string().min(1, "アーティストを選択してください"),
  artistStatus: z.enum(["CANDIDATE", "OFFER_SENT", "AWAITING_REPLY", "CONFIRMED", "DECLINED"]).default("CANDIDATE"),
  guaranteeAmount: z.number().nullable().optional(),
  settlementMethod: z.enum(["BANK_TRANSFER", "CASH", "OTHER"]).nullable().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  const projectArtists = await prisma.projectArtist.findMany({
    where: { projectId },
    include: {
      artist: true,
      statusHistories: {
        include: { changedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(projectArtists);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  try {
    const body = await request.json();
    const parsed = addArtistSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await prisma.projectArtist.findUnique({
      where: {
        projectId_artistId: {
          projectId,
          artistId: parsed.data.artistId,
        },
      },
    });

    if (existing) {
      return apiError("DUPLICATE", "このアーティストは既にプロジェクトに追加されています");
    }

    const projectArtist = await prisma.projectArtist.create({
      data: {
        projectId,
        artistId: parsed.data.artistId,
        artistStatus: parsed.data.artistStatus,
        guaranteeAmount: parsed.data.guaranteeAmount ?? null,
        settlementMethod: parsed.data.settlementMethod ?? null,
        notes: parsed.data.notes || null,
      },
      include: { artist: true },
    });

    return apiResponse(projectArtist);
  } catch {
    return apiError("INTERNAL_ERROR", "アーティストの追加に失敗しました", 500);
  }
}
