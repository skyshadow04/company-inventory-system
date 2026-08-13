import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const item = await prisma.items.findUnique({
      where: { item_id: Number(itemId) },
      include: { supplier: true },
    });

    if (!item) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to load item.", error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const itemIdNumber = Number(itemId);

    if (Number.isNaN(itemIdNumber)) {
      return NextResponse.json({ message: "Invalid item ID." }, { status: 400 });
    }

    const formData = await req.formData();
    const item_name = String(formData.get("item_name") ?? "").trim();
    const item_serial_number = String(formData.get("item_serial_number") ?? "").trim();
    const item_code = String(formData.get("item_code") ?? "").trim();
    const item_type = String(formData.get("item_type") ?? "").trim();
    const item_quantity = String(formData.get("item_quantity") ?? "0");
    const item_price = String(formData.get("item_price") ?? "0");
    const item_description = String(formData.get("item_description") ?? "").trim();
    const item_delivery_date = String(formData.get("item_delivery_date") ?? "");
    const supplier_id = String(formData.get("supplier_id") ?? "");
    const itemFile = formData.get("item_file");
    const itemPhoto = formData.get("item_photo");
    const removeItemFile = formData.get("remove_item_file") === "true";
    const removeItemPhoto = formData.get("remove_item_photo") === "true";

    if (!item_name || !item_code || !supplier_id) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const existingItem = await prisma.items.findUnique({
      where: { item_id: itemIdNumber },
    });

    if (!existingItem) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    const supplierIdNumber = Number(supplier_id);
    if (Number.isNaN(supplierIdNumber)) {
      return NextResponse.json({ message: "Supplier ID must be a number." }, { status: 400 });
    }

    let nextItemFileLink = existingItem.item_file_link || "";
    let nextItemPhotoLink = existingItem.item_file_photo_link || "";

    try {
      if (removeItemFile && existingItem.item_file_link) {
        await del(existingItem.item_file_link, { token: process.env.BLOB_READ_WRITE_TOKEN });
        nextItemFileLink = "";
      }

      if (itemFile instanceof File && itemFile.size > 0) {
        if (existingItem.item_file_link) {
          await del(existingItem.item_file_link, { token: process.env.BLOB_READ_WRITE_TOKEN });
        }

        const timestamp = Date.now();
        const filename = `items/${item_code}/document-${timestamp}-${itemFile.name}`;
        const blob = await put(filename, itemFile, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        nextItemFileLink = blob.url;
      }

      if (removeItemPhoto && existingItem.item_file_photo_link) {
        await del(existingItem.item_file_photo_link, { token: process.env.BLOB_READ_WRITE_TOKEN });
        nextItemPhotoLink = "";
      }

      if (itemPhoto instanceof File && itemPhoto.size > 0) {
        if (existingItem.item_file_photo_link) {
          await del(existingItem.item_file_photo_link, { token: process.env.BLOB_READ_WRITE_TOKEN });
        }

        const timestamp = Date.now();
        const filename = `items/${item_code}/photo-${timestamp}-${itemPhoto.name}`;
        const blob = await put(filename, itemPhoto, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        nextItemPhotoLink = blob.url;
      }
    } catch (uploadError: unknown) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown upload error";
      return NextResponse.json({ message: "Failed to update item files.", error: errorMessage }, { status: 500 });
    }

    const updatedItem = await prisma.items.update({
      where: { item_id: itemIdNumber },
      data: {
        item_name,
        item_serial_number,
        item_code,
        item_type: item_type || "Uncategorized",
        item_quantity: Number(item_quantity) || 0,
        item_price: item_price || "0",
        item_description,
        supplier_id: supplierIdNumber,
        item_file_link: nextItemFileLink,
        item_file_photo_link: nextItemPhotoLink,
        item_delivery_date: item_delivery_date ? new Date(item_delivery_date) : existingItem.item_delivery_date,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to update item.", error: message }, { status: 500 });
  }
}
