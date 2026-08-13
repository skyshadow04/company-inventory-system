import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const assets = await prisma.assets.findMany({
    orderBy: {
      asset_id: "desc",
    },
  });

  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const asset_name = String(formData.get("asset_name") ?? "").trim();
    const asset_serial_number = String(formData.get("asset_serial_number") ?? "").trim();
    const asset_owner = String(formData.get("asset_owner") ?? "").trim();
    const asset_status = String(formData.get("asset_status") ?? "Used").trim();
    const asset_type = String(formData.get("asset_type") ?? "").trim();
    const assetImage = formData.get("asset_image");

    if (!asset_name || !asset_owner || !asset_type) {
      return NextResponse.json({ message: "Asset name, owner, and type are required." }, { status: 400 });
    }

    let asset_image_link = "";

    if (assetImage instanceof File && assetImage.size > 0) {
      const timestamp = Date.now();
      const filename = `assets/${asset_name.replace(/\s+/g, "-")}/${timestamp}-${assetImage.name}`;
      const blob = await put(filename, assetImage, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      asset_image_link = blob.url;
    }

    const asset = await prisma.assets.create({
      data: {
        asset_name,
        asset_serial_number,
        asset_owner,
        asset_status: asset_status || "Used",
        asset_type,
        asset_image_link,
      },
    });

    return NextResponse.json(asset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Failed to create asset.", error: message }, { status: 500 });
  }
}
