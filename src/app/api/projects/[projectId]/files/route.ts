import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { put } from "@vercel/blob";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  const files = await prisma.projectFile.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(files);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId, isDeleted: false },
    });

    if (!project) {
      return apiError("NOT_FOUND", "プロジェクトが見つかりません", 404);
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

    const projectFile = await prisma.projectFile.create({
      data: {
        projectId,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return apiResponse(projectFile);
  } catch {
    return apiError("INTERNAL_ERROR", "ファイルのアップロードに失敗しました", 500);
  }
}
