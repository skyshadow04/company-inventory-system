import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getCurrentUser, hasAdminAccess, isSuperAdmin, selectedEntityFilter } from "@/lib/entityAccess";

const printerInclude = {
  toners: { orderBy: { toner_id: "asc" as const } },
  drums: { orderBy: { drum_id: "asc" as const } },
};

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const selectedEntity = new URL(request.url).searchParams.get("entity") || undefined;
  const printers = await prisma.printer.findMany({
    where: selectedEntityFilter(currentUser, selectedEntity),
    include: printerInclude,
    orderBy: { printer_id: "desc" },
  });

  return NextResponse.json(printers);
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, entity: true },
    });

    if (!currentUser || !hasAdminAccess(currentUser)) {
      return NextResponse.json({ message: "Forbidden: Only admins can create printers." }, { status: 403 });
    }

    const body = await request.json();
    const printerName = typeof body?.printerName === "string" ? body.printerName.trim() : "";
    const submittedEntity = typeof body?.entity === "string" ? body.entity.trim() : "";
    const entity = isSuperAdmin(currentUser) ? submittedEntity : currentUser.entity;
    const toners = Array.isArray(body?.toners) ? body.toners : [];
    const drums = Array.isArray(body?.drums) ? body.drums : [];

    if (!printerName || !entity) {
      return NextResponse.json({ message: "Printer name and entity are required." }, { status: 400 });
    }

    const normalizeConsumables = (records: unknown[], type: "toner" | "drum") => records.map((record) => {
      const value = record as Record<string, unknown>;
      const name = typeof value.name === "string" ? value.name.trim() : "";
      const code = typeof value.code === "string" ? value.code.trim() : "";
      const quantity = Number(value.quantity);
      return { name, code, quantity, valid: Boolean(name && code && Number.isInteger(quantity) && quantity >= 0), type };
    });

    const normalizedToners = normalizeConsumables(toners, "toner");
    const normalizedDrums = normalizeConsumables(drums, "drum");

    if ([...normalizedToners, ...normalizedDrums].some((record) => !record.valid)) {
      return NextResponse.json({ message: "Each toner and drum needs a name, code, and non-negative whole-number quantity." }, { status: 400 });
    }

    const printer = await prisma.printer.create({
      data: {
        printer_name: printerName,
        entity,
        toners: {
          create: normalizedToners.map(({ name, code, quantity }) => ({ toner_name: name, toner_code: code, toner_quantity: quantity })),
        },
        drums: {
          create: normalizedDrums.map(({ name, code, quantity }) => ({ drum_name: name, drum_code: code, drum_quantity: quantity })),
        },
      },
      include: printerInclude,
    });

    return NextResponse.json(printer, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to create printer.", error: message }, { status: 500 });
  }
}
