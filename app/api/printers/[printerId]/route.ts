import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getCurrentUser, hasAdminAccess, selectedEntityFilter } from "@/lib/entityAccess";

const printerInclude = {
  toners: { orderBy: { toner_id: "asc" as const } },
  drums: { orderBy: { drum_id: "asc" as const } },
};

export async function PUT(request: Request, { params }: { params: Promise<{ printerId: string }> }) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser || !hasAdminAccess(currentUser)) {
      return NextResponse.json({ message: "Forbidden: Only admins can edit printers." }, { status: 403 });
    }

    const printerId = Number((await params).printerId);
    if (!Number.isInteger(printerId)) {
      return NextResponse.json({ message: "Invalid printer ID." }, { status: 400 });
    }

    const existingPrinter = await prisma.printer.findFirst({
      where: { printer_id: printerId, ...selectedEntityFilter(currentUser, "all") },
    });
    if (!existingPrinter) {
      return NextResponse.json({ message: "Printer not found." }, { status: 404 });
    }

    const body = await request.json();
    const printerName = typeof body?.printerName === "string" ? body.printerName.trim() : "";
    const toners = Array.isArray(body?.toners) ? body.toners : [];
    const drums = Array.isArray(body?.drums) ? body.drums : [];

    if (!printerName || toners.length === 0) {
      return NextResponse.json({ message: "Printer name and at least one toner are required." }, { status: 400 });
    }

    const normalizeConsumables = (records: unknown[]) => records.map((record) => {
      const value = record as Record<string, unknown>;
      const name = typeof value.name === "string" ? value.name.trim() : "";
      const code = typeof value.code === "string" ? value.code.trim() : "";
      const quantity = Number(value.quantity);
      return { name, code, quantity, valid: Boolean(name && code && Number.isInteger(quantity) && quantity >= 0) };
    });

    const normalizedToners = normalizeConsumables(toners);
    const normalizedDrums = normalizeConsumables(drums);
    if ([...normalizedToners, ...normalizedDrums].some((record) => !record.valid)) {
      return NextResponse.json({ message: "Each toner and drum needs a name, code, and non-negative whole-number quantity." }, { status: 400 });
    }

    const updatedPrinter = await prisma.$transaction(async (transaction) => {
      await transaction.printerToner.deleteMany({ where: { printer_id: printerId } });
      await transaction.printerDrum.deleteMany({ where: { printer_id: printerId } });

      return transaction.printer.update({
        where: { printer_id: printerId },
        data: {
          printer_name: printerName,
          toners: {
            create: normalizedToners.map(({ name, code, quantity }) => ({ toner_name: name, toner_code: code, toner_quantity: quantity })),
          },
          drums: {
            create: normalizedDrums.map(({ name, code, quantity }) => ({ drum_name: name, drum_code: code, drum_quantity: quantity })),
          },
        },
        include: printerInclude,
      });
    });

    return NextResponse.json(updatedPrinter);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to update printer.", error: message }, { status: 500 });
  }
}
