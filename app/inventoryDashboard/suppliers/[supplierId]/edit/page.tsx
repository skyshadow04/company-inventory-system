import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/entityAccess";
import EditSupplierClient from "./client";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
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
      redirect("/inventoryDashboard/suppliers");
    }
  } catch {
    redirect("/login");
  }

  const { supplierId } = await params;

  return <EditSupplierClient supplierId={supplierId} />;
}

