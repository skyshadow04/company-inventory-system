import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      users,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error,
      },
      {
        status: 500,
      }
    );
  }
}