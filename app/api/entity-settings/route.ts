import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getCurrentUser, hasAdminAccess } from "@/lib/entityAccess";
import { isEntityTheme } from "@/lib/entityTheme";

async function getAuthenticatedUser() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      return null;
    }

    return prisma.user.findUnique({ where: { id: payload.id } });
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.entitySettings.findUnique({ where: { entity: user.entity } });

  return NextResponse.json({ theme: settings?.theme ?? "ocean", entity: user.entity });
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser();

  if (!user || !hasAdminAccess(user)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const theme = body?.theme;

  if (!isEntityTheme(theme)) {
    return NextResponse.json({ message: "Choose a supported theme." }, { status: 400 });
  }

  const settings = await prisma.entitySettings.upsert({
    where: { entity: user.entity },
    create: { entity: user.entity, theme },
    update: { theme },
  });

  return NextResponse.json({ theme: settings.theme, entity: settings.entity });
}
