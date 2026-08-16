import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Supplier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { SupplierDashboard } from "@/components/dashboard/supplier-dashboard";

export default async function SuppliersDashboardPage() {
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

  const activeSuppliers: Supplier[] = await prisma.supplier.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      supplier_id: "desc",
    },
  });

  const inactiveSuppliers: Supplier[] = await prisma.supplier.findMany({
    where: {
      isActive: false,
    },
    orderBy: {
      supplier_id: "desc",
    },
  });

  const isAdmin = currentUser?.role === "admin";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Supplier Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Suppliers</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your supplier contacts and review registered suppliers.</p>
        </div>
        {isAdmin && (
          <Link href="/inventoryDashboard/suppliers/addSupplier" className="inline-flex rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">Add Supplier</Link>
        )}
      </div>

      <SupplierDashboard activeSuppliers={activeSuppliers} inactiveSuppliers={inactiveSuppliers} isAdmin={isAdmin} />
    </main>
  );
}
