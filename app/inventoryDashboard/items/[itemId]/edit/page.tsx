import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/entityAccess";
import EditItemClient from "./client";

export default async function EditInventoryItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
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
      redirect("/inventoryDashboard/items");
    }
  } catch {
    redirect("/login");
  }

  const { itemId } = await params;

  return <EditItemClient itemId={itemId} />;
}

