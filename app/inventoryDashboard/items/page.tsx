import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ItemsDashboard, type ItemWithSupplier } from "@/components/dashboard/items-dashboard";

export default async function ItemsDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let currentUser: { role: string } | null = null;

  try {
    const payload = verifyToken(token);

    if (typeof payload === "object" && payload !== null && typeof payload.id === "number") {
      currentUser = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { role: true },
      });
    }
  } catch {
    redirect("/login");
  }

  const items: ItemWithSupplier[] = await prisma.items.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      item_id: "desc",
    },
  });

  const isAdmin = currentUser?.role === "admin";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Inventory Items</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Items Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Review your inventory items and supplier associations.</p>
        </div>
        {isAdmin && (
          <Link href="/inventoryDashboard/items/addItem" className="inline-flex rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">Add New Item</Link>
        )}
      </div>

      <ItemsDashboard items={items} isAdmin={isAdmin} />
    </main>
  );
}
