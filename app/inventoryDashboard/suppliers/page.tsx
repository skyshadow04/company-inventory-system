import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Supplier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasAdminAccess, isSuperAdmin, selectedEntityFilter } from "@/lib/entityAccess";
import { EntityFilter } from "@/components/entity-filter";
import { SupplierDashboard } from "@/components/dashboard/supplier-dashboard";

export default async function SuppliersDashboardPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedEntity = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : undefined;
  const initialPage = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const superAdmin = isSuperAdmin(currentUser);
  const entityOptions = superAdmin
    ? (await prisma.user.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } })).map((user) => user.entity)
    : [];
  const recordFilter = selectedEntityFilter(currentUser, selectedEntity);

  const [activeSuppliers, inactiveSuppliers, supplierOrderCounts] = await Promise.all([
    prisma.supplier.findMany({
      where: {
        isActive: true,
        ...recordFilter,
      },
      orderBy: {
        supplier_id: "desc",
      },
    }),
    prisma.supplier.findMany({
      where: {
        isActive: false,
        ...recordFilter,
      },
      orderBy: {
        supplier_id: "desc",
      },
    }),
    prisma.items.groupBy({
      by: ["supplier_id"],
      where: recordFilter,
      _count: {
        item_id: true,
      },
    }),
  ]);

  const supplierOrderMap = Object.fromEntries(
    supplierOrderCounts.map((entry) => [String(entry.supplier_id), entry._count.item_id]),
  );

  const isAdmin = hasAdminAccess(currentUser);

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

      {superAdmin && <EntityFilter entities={entityOptions} selectedEntity={selectedEntity || ""} />}

      <SupplierDashboard
        activeSuppliers={activeSuppliers}
        inactiveSuppliers={inactiveSuppliers}
        supplierOrderMap={supplierOrderMap}
        isAdmin={isAdmin}
        initialPage={initialPage}
        selectedEntity={selectedEntity}
      />
    </main>
  );
}
