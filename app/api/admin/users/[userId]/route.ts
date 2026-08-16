import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId } = await context.params;
    const userIdNumber = Number(userId);

    if (!Number.isInteger(userIdNumber)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, role, password, isActive } = body || {};

    if (!name || !email || !role) {
      return NextResponse.json({ message: "Name, email and role are required" }, { status: 400 });
    }

    if (typeof isActive !== "undefined" && typeof isActive !== "boolean") {
      return NextResponse.json({ message: "isActive must be a boolean" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: String(email).trim() } });

    if (existingUser && existingUser.id !== userIdNumber) {
      return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
    }

    const updateData: {
      name: string;
      email: string;
      role: string;
      password?: string;
      isActive?: boolean;
    } = {
      name: String(name).trim(),
      email: String(email).trim(),
      role: String(role).trim(),
    };

    if (typeof password === "string" && password.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 12);
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const user = await prisma.user.update({
      where: { id: userIdNumber },
      data: updateData,
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Update failed", error: message }, { status: 500 });
  }
}
