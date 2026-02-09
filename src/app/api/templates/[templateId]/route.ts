import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { emailTemplateSchema } from "@/schemas/email-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { templateId } = await params;

  const template = await prisma.emailTemplate.findUnique({
    where: { id: templateId },
    include: { createdBy: { select: { name: true } } },
  });

  if (!template) {
    return apiError("NOT_FOUND", "テンプレートが見つかりません", 404);
  }

  return apiResponse(template);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { templateId } = await params;

  try {
    const body = await request.json();
    const parsed = emailTemplateSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: parsed.data,
      include: { createdBy: { select: { name: true } } },
    });

    return apiResponse(template);
  } catch {
    return apiError("INTERNAL_ERROR", "テンプレートの更新に失敗しました", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { templateId } = await params;

  try {
    await prisma.emailTemplate.delete({ where: { id: templateId } });
    return apiResponse({ deleted: true });
  } catch {
    return apiError("INTERNAL_ERROR", "テンプレートの削除に失敗しました", 500);
  }
}
