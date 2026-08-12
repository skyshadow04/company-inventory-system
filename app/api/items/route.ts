import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.items.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      item_id: "desc",
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemName, itemCode, category, quantity, unitPrice, supplierId, description } = body;

    if (!itemName || !itemCode || !supplierId) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const supplierIdNumber = Number(supplierId);
    if (Number.isNaN(supplierIdNumber)) {
      return NextResponse.json({ message: "Supplier ID must be a number." }, { status: 400 });
    }

    const item = await prisma.items.create({
      data: {
        item_name: itemName,
        item_code: itemCode,
        item_type: category || "Uncategorized",
        item_price: unitPrice || "0",
        item_quantity: Number(quantity) || 0,
        item_description: description || "",
        supplier_id: supplierIdNumber,
        item_file_link: "",
        item_file_photo_link: "",
        item_delivery_date: new Date(),
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create item.", error: error.message }, { status: 500 });
  }
}
