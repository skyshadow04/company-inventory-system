import { prisma } from "@/lib/prisma";
import { isValidSupplierContact, SUPPLIER_PHONE_ERROR_MESSAGE } from "@/lib/supplierValidation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { selectedEntityFilter, getCurrentUser, hasAdminAccess, isSuperAdmin } from "@/lib/entityAccess";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const selectedEntity = searchParams.get("entity") || "all";

  const suppliers = await prisma.supplier.findMany({
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      ...selectedEntityFilter(currentUser, selectedEntity),
    },
    orderBy: {
      supplier_id: "desc",
    },
  });

  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
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
      return NextResponse.json({ message: "Forbidden: Only admins can create suppliers" }, { status: 403 });
    }

    const body = await req.json();
    const { supplierName, supplierContact } = body;
    const submittedEntity = typeof body?.entity === "string" ? body.entity.trim() : "";
    const entity = isSuperAdmin(currentUser) ? submittedEntity : currentUser.entity;

    if (!supplierName || !supplierContact || !entity) {
      return NextResponse.json({ message: "Missing supplier name or contact." }, { status: 400 });
    }

    const trimmedContact = String(supplierContact).trim();

    if (!isValidSupplierContact(trimmedContact)) {
      return NextResponse.json(
        { message: SUPPLIER_PHONE_ERROR_MESSAGE },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        supplier_name: supplierName,
        supplier_contact_number: trimmedContact,
        isActive: true,
        entity,
      },
    });

    return NextResponse.json(supplier);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to create supplier.", error: message }, { status: 500 });
  }
}
