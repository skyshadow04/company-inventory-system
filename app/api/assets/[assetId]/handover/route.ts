import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, selectedEntityFilter } from "@/lib/entityAccess";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ message: "Authentication required." }, { status: 401 });
  }

  const assetId = Number((await params).assetId);
  const selectedEntity = request.nextUrl.searchParams.get("entity") || undefined;

  if (!Number.isInteger(assetId)) {
    return Response.json({ message: "Invalid asset ID." }, { status: 400 });
  }

  const asset = await prisma.assets.findFirst({
    where: { asset_id: assetId, ...selectedEntityFilter(currentUser, selectedEntity) },
    select: {
      asset_id: true,
      asset_name: true,
      asset_serial_number: true,
      asset_owner: true,
    },
  });

  if (!asset) {
    return Response.json({ message: "Asset not found." }, { status: 404 });
  }

  const template = await readFile(path.join(process.cwd(), "public", "pdf", "LS IT Asset Handover Form.pdf"));
  const pdf = await PDFDocument.load(template);
  const page = pdf.getPages()[0];
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const black = rgb(0, 0, 0);
  const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const releaserName = currentUser.name.trim();

  const fields = [
    { value: asset.asset_name, y: 653.26 },
    { value: asset.asset_serial_number || "N/A", y: 614.14 },
    { value: releaserName, y: 575.02 },
    { value: date, y: 496.75 },
    { value: asset.asset_owner, y: 457.63 },
    { value: date, y: 379.51 },
  ];

  for (const field of fields) {
    let fontSize = 13;
    while (fontSize > 8 && font.widthOfTextAtSize(field.value, fontSize) > 212) {
      fontSize -= 0.5;
    }

    page.drawText(field.value, {
      x: 303,
      y: field.y + 3,
      size: fontSize,
      font,
      color: black,
    });
  }

  const output = Buffer.from(await pdf.save());
  const safeAssetName = asset.asset_name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "asset";

  return new Response(output, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="asset-handover-${safeAssetName}-${asset.asset_id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}