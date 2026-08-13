import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

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
    const formData = await req.formData();
    const item_name = formData.get("item_name") as string;
    const item_serial_number = formData.get("item_serial_number") as string;
    const item_code = formData.get("item_code") as string;
    const item_type = formData.get("item_type") as string;
    const item_quantity = formData.get("item_quantity") as string;
    const item_price = formData.get("item_price") as string;
    const item_description = formData.get("item_description") as string;
    const item_delivery_date = formData.get("item_delivery_date") as string;
    const supplier_id = formData.get("supplier_id") as string;
    const itemFile = formData.get("item_file") as File | null;
    const itemPhoto = formData.get("item_photo") as File | null;

    if (!item_name || !item_code || !supplier_id) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const supplierIdNumber = Number(supplier_id);
    if (Number.isNaN(supplierIdNumber)) {
      return NextResponse.json({ message: "Supplier ID must be a number." }, { status: 400 });
    }

    // Upload files to Vercel Blob storage
    let item_file_link = "";
    let item_file_photo_link = "";

    try {
      if (itemFile) {
        const timestamp = Date.now();
        const filename = `items/${item_code}/document-${timestamp}-${itemFile.name}`;
        const blob = await put(filename, itemFile, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        item_file_link = blob.url;
      }

      if (itemPhoto) {
        const timestamp = Date.now();
        const filename = `items/${item_code}/photo-${timestamp}-${itemPhoto.name}`;
        const blob = await put(filename, itemPhoto, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        item_file_photo_link = blob.url;
      }
    } catch (uploadError: unknown) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown upload error";
      return NextResponse.json({ message: "Failed to upload files to blob storage.", error: errorMessage }, { status: 500 });
    }

    const item = await prisma.items.create({
      data: {
        item_name,
        item_serial_number: item_serial_number || "",
        item_code,
        item_type: item_type || "Uncategorized",
        item_price: item_price || "0",
        item_quantity: Number(item_quantity) || 0,
        item_description: item_description || "",
        supplier_id: supplierIdNumber,
        item_file_link,
        item_file_photo_link,
        item_delivery_date: item_delivery_date ? new Date(item_delivery_date) : new Date(),
      },
    });

    return NextResponse.json(item);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to create item.", error: message }, { status: 500 });
  }
}
