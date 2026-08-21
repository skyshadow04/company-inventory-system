import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { put } from "@vercel/blob";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const payload = verifyToken(token);

    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      return NextResponse.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        image_link: user.image_link,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ authenticated: false });
  }
}

export async function PATCH(req: Request) {
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
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "").trim();
    const profileImage = formData.get("profile_image");

    if (!name || !email || !email.includes("@")) {
      return NextResponse.json({ message: "A valid name and email are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== currentUser.id) {
      return NextResponse.json({ message: "Email is already in use." }, { status: 400 });
    }

    const updateData: { name: string; email: string; password?: string; image_link?: string } = { name, email };

    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (profileImage instanceof File && profileImage.size > 0) {
      if (!profileImage.type.startsWith("image/")) {
        return NextResponse.json({ message: "Profile image must be an image file." }, { status: 400 });
      }
      if (profileImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "Profile image must be smaller than 5 MB." }, { status: 400 });
      }

      const blob = await put(`profiles/${currentUser.id}/${Date.now()}-${profileImage.name}`, profileImage, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      updateData.image_link = blob.url;
    }

    const user = await prisma.user.update({ where: { id: currentUser.id }, data: updateData });

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        image_link: user.image_link,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(error);
    return NextResponse.json({ message: "Profile update failed.", error: message }, { status: 500 });
  }
}
