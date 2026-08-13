import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const { assetId } = await params;
    const asset = await prisma.assets.findUnique({
      where: { asset_id: Number(assetId) },
    });

    if (!asset) {
      return NextResponse.json({ message: "Asset not found." }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to load asset.", error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const { assetId } = await params;
    const assetIdNumber = Number(assetId);

    if (Number.isNaN(assetIdNumber)) {
      return NextResponse.json({ message: "Invalid asset ID." }, { status: 400 });
    }

    const formData = await req.formData();
    const asset_name = String(formData.get("asset_name") ?? "").trim();
    const asset_serial_number = String(formData.get("asset_serial_number") ?? "").trim();
    const asset_owner = String(formData.get("asset_owner") ?? "").trim();
    const asset_status = String(formData.get("asset_status") ?? "Used").trim();
    const asset_type = String(formData.get("asset_type") ?? "").trim();
    const assetImage = formData.get("asset_image");
    const removeAssetImage = formData.get("remove_asset_image") === "true";

    if (!asset_name || !asset_owner || !asset_type) {
      return NextResponse.json({ message: "Asset name, owner, and type are required." }, { status: 400 });
    }

    const existingAsset = await prisma.assets.findUnique({
      where: { asset_id: assetIdNumber },
    });

    if (!existingAsset) {
      return NextResponse.json({ message: "Asset not found." }, { status: 404 });
    }

    let nextImageLink = existingAsset.asset_image_link || "";

    try {
      if (removeAssetImage && existingAsset.asset_image_link) {
        await del(existingAsset.asset_image_link, { token: process.env.BLOB_READ_WRITE_TOKEN });
        nextImageLink = "";
      }

      if (assetImage instanceof File && assetImage.size > 0) {
        if (existingAsset.asset_image_link) {
          await del(existingAsset.asset_image_link, { token: process.env.BLOB_READ_WRITE_TOKEN });
        }

        const timestamp = Date.now();
        const filename = `assets/${asset_name.replace(/\s+/g, "-")}/${timestamp}-${assetImage.name}`;
        const blob = await put(filename, assetImage, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        nextImageLink = blob.url;
      }
    } catch (uploadError: unknown) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown upload error";
      return NextResponse.json({ message: "Failed to update asset image.", error: errorMessage }, { status: 500 });
    }

    const updatedAsset = await prisma.assets.update({
      where: { asset_id: assetIdNumber },
      data: {
        asset_name,
        asset_serial_number,
        asset_owner,
        asset_status: asset_status || "Used",
        asset_type,
        asset_image_link: nextImageLink,
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to update asset.", error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const { assetId } = await params;
    const assetIdNumber = Number(assetId);

    const asset = await prisma.assets.findUnique({
      where: { asset_id: assetIdNumber },
    });

    if (!asset) {
      return NextResponse.json({ message: "Asset not found." }, { status: 404 });
    }

    if (asset.asset_image_link) {
      await del(asset.asset_image_link, { token: process.env.BLOB_READ_WRITE_TOKEN });
    }

    await prisma.assets.delete({
      where: { asset_id: assetIdNumber },
    });

    return NextResponse.json({ message: "Asset deleted successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to delete asset.", error: message }, { status: 500 });
  }
}
