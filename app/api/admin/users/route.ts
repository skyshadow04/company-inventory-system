import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { hasAdminAccess, isSuperAdmin } from "@/lib/entityAccess";

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
    return null;
  }

  const currentUser = await prisma.user.findUnique({ where: { id: payload.id } });

  return currentUser && hasAdminAccess(currentUser) ? currentUser : null;
}

export async function POST(req: Request) {
  try {
    const currentUser = await getAdminUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const company_number = typeof body?.company_number === "string" ? body.company_number.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password.trim() : "";
    const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword.trim() : "";
    const role = typeof body?.role === "string" ? body.role.trim().toLowerCase() : "";
    const submittedEntity = typeof body?.entity === "string" ? body.entity.trim() : "";
    const entity = isSuperAdmin(currentUser) ? submittedEntity : currentUser.entity;

    if (!name || !email || !password || !confirmPassword || !role || !entity) {
      return NextResponse.json(
        { message: "Name, email, password and role are required" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    if (!["admin", "staff"].includes(role)) {
      return NextResponse.json({ message: "Role must be admin or staff" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
    }

    if (company_number) {
      const existingCompanyNumber = await prisma.user.findUnique({ where: { company_number } });
      if (existingCompanyNumber) {
        return NextResponse.json({ message: "Company contact number is already in use" }, { status: 400 });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        company_number: company_number || null,
        email,
        password: await bcrypt.hash(password, 12),
        role,
        entity,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        company_number: user.company_number,
        email: user.email,
        role: user.role,
        entity: user.entity,
        isActive: user.isActive,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "User creation failed", error: message }, { status: 500 });
  }
}

export async function GET() {
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

    if (!currentUser || !hasAdminAccess(currentUser)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: isSuperAdmin(currentUser) ? {} : { entity: currentUser.entity },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        company_number: true,
        email: true,
        role: true,
        entity: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to load users", error: message }, { status: 500 });
  }
}
