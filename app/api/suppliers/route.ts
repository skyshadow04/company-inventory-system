import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
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

    const supplier = await prisma.supplier.create({
      data: {
        supplier_name: supplierName,
        supplier_contact_number: supplierContact,
      },
    });

    return NextResponse.json(supplier);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create supplier.", error: error.message }, { status: 500 });
  }
}
