import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasAdminAccess, selectedEntityFilter } from "@/lib/entityAccess";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminAccess(currentUser)) {
    return NextResponse.json({ message: "Forbidden: Only admins can view asset history" }, { status: 403 });
  }

  const assetId = Number((await params).assetId);

  if (!Number.isInteger(assetId)) {
    return NextResponse.json({ message: "Invalid asset ID." }, { status: 400 });
  }

  const asset = await prisma.assets.findFirst({
    where: { asset_id: assetId, ...selectedEntityFilter(currentUser, "all") },
    select: {
      asset_id: true,
      asset_name: true,
      asset_serial_number: true,
      asset_owner: true,
      asset_status: true,
      asset_type: true,
      entity: true,
    },
  });

  if (!asset) {
    return NextResponse.json({ message: "Asset not found." }, { status: 404 });
  }

  const history = await prisma.assetHistory.findMany({
    where: {
      asset_id: assetId,
      ...selectedEntityFilter(currentUser, "all"),
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { asset_history_date: "desc" },
  });

  return NextResponse.json({ asset, history });
}
