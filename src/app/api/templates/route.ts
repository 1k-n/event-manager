import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { emailTemplateSchema } from "@/schemas/email-template";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const templates = await prisma.emailTemplate.findMany({
    where: type ? { type: type as "OFFER" | "CONFIRMED" | "REMINDER" | "THANKS" } : {},
    include: {
      createdBy: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return apiResponse(templates);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  try {
    const body = await request.json();
    const parsed = emailTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        subject: parsed.data.subject,
        body: parsed.data.body,
        createdById: session.user?.id as string,
      },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    return apiResponse(template);
  } catch {
    return apiError("INTERNAL_ERROR", "テンプレートの作成に失敗しました", 500);
  }
}
