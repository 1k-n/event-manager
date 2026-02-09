import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { del } from "@vercel/blob";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string; fileId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { artistId, fileId } = await params;

  try {
    const file = await prisma.artistFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.artistId !== artistId) {
      return apiError("NOT_FOUND", "ファイルが見つかりません", 404);
    }

    await del(file.fileUrl);

    await prisma.artistFile.delete({
      where: { id: fileId },
    });

    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "ファイルの削除に失敗しました", 500);
  }
}
