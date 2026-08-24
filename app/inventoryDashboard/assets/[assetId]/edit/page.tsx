import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/entityAccess";
import EditAssetClient from "./client";

export default async function EditAssetPage({
  params,
  searchParams,
}: {
  params: Promise<{ assetId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const payload = verifyToken(token);

    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      redirect("/login");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { role: true },
    });

    if (!currentUser || !hasAdminAccess(currentUser)) {
      redirect("/inventoryDashboard/assets");
    }
  } catch {
    redirect("/login");
  }

  const { assetId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedEntity = String(resolvedSearchParams.entity ?? "");
  const page = String(resolvedSearchParams.page ?? "1");

  return <EditAssetClient assetId={assetId} selectedEntity={selectedEntity} page={page} />;
}

