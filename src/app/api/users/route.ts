import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return apiError("UNAUTHORIZED", "認証が必要です", 401);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return apiResponse(users);
}
