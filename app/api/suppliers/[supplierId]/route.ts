import { prisma } from "@/lib/prisma";
import { isValidSupplierContact, SUPPLIER_PHONE_ERROR_MESSAGE } from "@/lib/supplierValidation";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ supplierId: string }> }) {
  try {
    const { supplierId } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { supplier_id: Number(supplierId) },
    });

    if (!supplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to load supplier.", error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ supplierId: string }> }) {
  try {
    const { supplierId } = await params;
    const body = await req.json();
    const { supplierName, supplierContact } = body;

    if (!supplierName || !supplierContact) {
      return NextResponse.json({ message: "Missing supplier name or contact." }, { status: 400 });
    }

    const trimmedContact = String(supplierContact).trim();

    if (!isValidSupplierContact(trimmedContact)) {
      return NextResponse.json({ message: SUPPLIER_PHONE_ERROR_MESSAGE }, { status: 400 });
    }

    const supplier = await prisma.supplier.update({
      where: { supplier_id: Number(supplierId) },
      data: {
        supplier_name: String(supplierName).trim(),
        supplier_contact_number: trimmedContact,
      },
    });

    return NextResponse.json(supplier);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to update supplier.", error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ supplierId: string }> }) {
  try {
    const { supplierId } = await params;
    const supplier = await prisma.supplier.update({
      where: { supplier_id: Number(supplierId) },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ message: "Supplier deactivated successfully.", supplier });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to deactivate supplier.", error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ supplierId: string }> }) {
  try {
    const { supplierId } = await params;
    const body = await req.json();
    const { isActive } = body;

    const supplier = await prisma.supplier.update({
      where: { supplier_id: Number(supplierId) },
      data: {
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ message: isActive ? "Supplier activated successfully." : "Supplier deactivated successfully.", supplier });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to update supplier status.", error: message }, { status: 500 });
  }
}
