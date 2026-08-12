import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { isRateLimited, getRateLimitInfo } from "@/lib/rateLimit";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, password } = body || {};

		// basic validation
		if (typeof email !== "string" || typeof password !== "string") {
			return NextResponse.json({ message: "Invalid input" }, { status: 400 });
		}

		const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

		if (isRateLimited(ip)) {
			const info = getRateLimitInfo(ip);
			return NextResponse.json(
				{ message: "Too many requests", retryAfterMs: info.resetIn },
				{ status: 429 }
			);
		}

		if (!email || !password) {
			return NextResponse.json(
				{ message: "Email and password are required" },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			return NextResponse.json(
				{ message: "Invalid credentials" },
				{ status: 401 }
			);
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			return NextResponse.json(
				{ message: "Invalid credentials" },
				{ status: 401 }
			);
		}

		const token = createToken(user.id);

		const res = NextResponse.json({
			message: "Login successful",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});

		res.cookies.set({
			name: "token",
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24, // 1 day in seconds
		});

		return res;
	} catch (error: any) {
		console.error(error);
		return NextResponse.json(
			{ message: "Login failed", error: error?.message },
			{ status: 500 }
		);
	}
}

