import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const payload: any = verifyToken(token);

    if (!payload?.id) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ authenticated: false });
  }
}
