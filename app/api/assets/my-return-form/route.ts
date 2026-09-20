import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { getCurrentUser, hasAdminAccess, isSuperAdmin } from "@/lib/entityAccess";
import { prisma } from "@/lib/prisma";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 42;
const TABLE_TOP = 650;
const ROW_HEIGHT = 34;
const COLUMN_WIDTHS = [170, 145, 145, 51];

function fitText(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, maxWidth: number, size = 9) {
  let fontSize = size;

  while (fontSize > 6 && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
    fontSize -= 0.5;
  }

  return { text, size: fontSize };
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const requestedUserId = requestUrl.searchParams.get("userId");
  let targetUser: { name: string; entity: string } = currentUser;

  if (hasAdminAccess(currentUser)) {
    const userId = Number(requestedUserId);

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ message: "Choose a user for the return form." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, entity: true },
    });

    if (!target || (!isSuperAdmin(currentUser) && target.entity !== currentUser.entity)) {
      return NextResponse.json({ message: "User is outside your entity scope." }, { status: 403 });
    }

    targetUser = target;
  } else if (requestedUserId && Number(requestedUserId) !== currentUser.id) {
    return NextResponse.json({ message: "You can only create your own return form." }, { status: 403 });
  }

  const assetIdsParam = requestUrl.searchParams.get("assetIds");
  let assetIdFilter: { asset_id?: { in: number[] } } = {};
  let requestedAssetIds: number[] | undefined;

  if (assetIdsParam !== null) {
    const assetIds = assetIdsParam
      .split(",")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    if (assetIds.length === 0) {
      return NextResponse.json({ message: "Select at least one asset to return." }, { status: 400 });
    }

    requestedAssetIds = Array.from(new Set(assetIds));
    assetIdFilter = { asset_id: { in: requestedAssetIds } };
  }

  const assets = await prisma.assets.findMany({
    where: { entity: targetUser.entity, asset_owner: targetUser.name, ...assetIdFilter },
    select: {
      asset_name: true,
      asset_serial_number: true,
    },
    orderBy: { asset_name: "asc" },
  });

  if (requestedAssetIds && assets.length !== requestedAssetIds.length) {
    return NextResponse.json({ message: "One or more selected assets are outside the user scope." }, { status: 403 });
  }

  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.12, 0.16, 0.22);
  const muted = rgb(0.35, 0.39, 0.46);
  const line = rgb(0.78, 0.81, 0.85);
  const pale = rgb(0.95, 0.97, 0.98);
  const pageNumberLabel = `Generated ${new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date())}`;

  const drawPageHeader = (page: ReturnType<typeof pdf.addPage>) => {
    page.drawText("Asset Return Approval Form", {
      x: MARGIN,
      y: 780,
      size: 18,
      font: boldFont,
      color: dark,
    });
    page.drawText("Leadership Domestic Workers Service Center", {
      x: MARGIN,
      y: 758,
      size: 10,
      font: regularFont,
      color: muted,
    });
    page.drawText(pageNumberLabel, {
      x: PAGE_WIDTH - MARGIN - regularFont.widthOfTextAtSize(pageNumberLabel, 9),
      y: 758,
      size: 9,
      font: regularFont,
      color: muted,
    });

    page.drawText("Name", { x: MARGIN, y: 718, size: 9, font: boldFont, color: muted });
    page.drawText(targetUser.name, { x: MARGIN + 42, y: 718, size: 11, font: regularFont, color: dark });
    page.drawText("Entity", { x: 330, y: 718, size: 9, font: boldFont, color: muted });
    page.drawText(targetUser.entity, { x: 370, y: 718, size: 11, font: regularFont, color: dark });
  };

  const drawTableHeader = (page: ReturnType<typeof pdf.addPage>) => {
    const headers = ["Asset name", "Serial number", "Note", "Return"];
    let x = MARGIN;

    page.drawRectangle({
      x: MARGIN,
      y: TABLE_TOP,
      width: COLUMN_WIDTHS.reduce((sum, width) => sum + width, 0),
      height: 28,
      color: pale,
    });

    headers.forEach((header, index) => {
      page.drawText(header, { x: x + 7, y: TABLE_TOP + 9, size: 9, font: boldFont, color: dark });
      x += COLUMN_WIDTHS[index];
    });
  };

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageHeader(page);
  drawTableHeader(page);
  let y = TABLE_TOP - ROW_HEIGHT;

  if (assets.length === 0) {
    page.drawText("No assets are currently assigned to you.", {
      x: MARGIN + 8,
      y: y + 11,
      size: 10,
      font: regularFont,
      color: muted,
    });
    y -= ROW_HEIGHT;
  } else {
    for (const asset of assets) {
      if (y < 150) {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        drawPageHeader(page);
        drawTableHeader(page);
        y = TABLE_TOP - ROW_HEIGHT;
      }

      const rowWidth = COLUMN_WIDTHS.reduce((sum, width) => sum + width, 0);
      page.drawRectangle({ x: MARGIN, y, width: rowWidth, height: ROW_HEIGHT, borderColor: line, borderWidth: 0.7 });

      let x = MARGIN;
      const values = [asset.asset_name, asset.asset_serial_number || "N/A"];
      values.forEach((value, index) => {
        const fitted = fitText(value, regularFont, COLUMN_WIDTHS[index] - 14);
        page.drawText(fitted.text, { x: x + 7, y: y + 12, size: fitted.size, font: regularFont, color: dark });
        x += COLUMN_WIDTHS[index];
      });

      page.drawLine({ start: { x: MARGIN + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + 7, y: y + 10 }, end: { x: MARGIN + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + COLUMN_WIDTHS[2] - 8, y: y + 10 }, thickness: 0.7, color: muted });

      const checkboxX = MARGIN + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + COLUMN_WIDTHS[2] + 18;
      page.drawRectangle({ x: checkboxX, y: y + 9, width: 14, height: 14, borderColor: dark, borderWidth: 1 });

      for (let index = 1; index < COLUMN_WIDTHS.length; index += 1) {
        const dividerX = MARGIN + COLUMN_WIDTHS.slice(0, index).reduce((sum, width) => sum + width, 0);
        page.drawLine({ start: { x: dividerX, y }, end: { x: dividerX, y: y + ROW_HEIGHT }, thickness: 0.7, color: line });
      }

      y -= ROW_HEIGHT;
    }
  }

  if (y < 145) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageHeader(page);
    y = 620;
  }

  const signatureY = Math.max(y - 30, 100);
  page.drawText("Signatures", { x: MARGIN, y: signatureY + 52, size: 12, font: boldFont, color: dark });
  page.drawLine({ start: { x: MARGIN, y: signatureY + 20 }, end: { x: 250, y: signatureY + 20 }, thickness: 1, color: dark });
  page.drawLine({ start: { x: 325, y: signatureY + 20 }, end: { x: 553, y: signatureY + 20 }, thickness: 1, color: dark });
  page.drawText("User signature", { x: MARGIN, y: signatureY + 5, size: 9, font: regularFont, color: muted });
  page.drawText("Approver signature", { x: 325, y: signatureY + 5, size: 9, font: regularFont, color: muted });
  page.drawText("Tick Return for each asset when it has been returned.", { x: MARGIN, y: 55, size: 9, font: regularFont, color: muted });

  const output = Buffer.from(await pdf.save());
  const safeName = targetUser.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "user";
  const disposition = requestUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

  return new Response(output, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="asset-return-form-${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
