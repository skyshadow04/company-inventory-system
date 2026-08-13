"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Supplier } from "@prisma/client";

interface SupplierListProps {
  suppliers: Supplier[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
  const router = useRouter();

  return (
    <>
      {suppliers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          No suppliers were found. Add a supplier to start linking items to vendors.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div key={supplier.supplier_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-500">ID: {supplier.supplier_id}</p>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Active
                </span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{supplier.supplier_name}</h2>
              <p className="mt-3 text-sm text-slate-600">Contact: {supplier.supplier_contact_number}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">Created {supplier.created_at.toISOString().split("T")[0]}</p>
              <div className="mt-5 flex justify-end gap-2">
                <Link
                  href={`/inventoryDashboard/suppliers/${supplier.supplier_id}/edit`}
                  className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/suppliers/${supplier.supplier_id}`, {
                      method: "DELETE",
                    });
                    router.refresh();
                  }}
                  className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
