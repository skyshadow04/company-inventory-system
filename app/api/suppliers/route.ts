import { prisma } from "@/lib/prisma";
import { isValidSupplierContact, SUPPLIER_PHONE_ERROR_MESSAGE } from "@/lib/supplierValidation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  const suppliers = await prisma.supplier.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: {
      supplier_id: "desc",
    },
  });

  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplierName, supplierContact } = body;

    if (!supplierName || !supplierContact) {
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
      },
    });

    return NextResponse.json(supplier);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to create supplier.", error: message }, { status: 500 });
  }
}
