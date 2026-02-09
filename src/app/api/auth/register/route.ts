import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { registerSchema } from "@/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse({ ...body, confirmPassword: body.password });

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      return apiError("EMAIL_EXISTS", "このメールアドレスは既に登録されています", 409);
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return apiResponse(user);
  } catch {
    return apiError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500);
  }
}
