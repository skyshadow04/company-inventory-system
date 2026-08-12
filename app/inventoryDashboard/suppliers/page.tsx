import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Supplier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function SuppliersDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    verifyToken(token);
  } catch {
    redirect("/login");
  }

  const suppliers: Supplier[] = await prisma.supplier.findMany({
    orderBy: {
      supplier_id: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Supplier Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Suppliers</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your supplier contacts and review registered suppliers.</p>
        </div>
        <Link href="/inventoryDashboard/suppliers/addSupplier" className="inline-flex rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">Add Supplier</Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          No suppliers were found. Add a supplier to start linking items to vendors.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier: Supplier) => (
            <div key={supplier.supplier_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">ID: {supplier.supplier_id}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{supplier.supplier_name}</h2>
              <p className="mt-3 text-sm text-slate-600">Contact: {supplier.supplier_contact_number}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">Created {supplier.created_at.toISOString().split("T")[0]}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
