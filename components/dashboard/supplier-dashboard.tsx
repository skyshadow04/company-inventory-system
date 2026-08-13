"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Supplier } from "@prisma/client";

interface SupplierDashboardProps {
  activeSuppliers: Supplier[];
  inactiveSuppliers: Supplier[];
}

export function SupplierDashboard({ activeSuppliers, inactiveSuppliers }: SupplierDashboardProps) {
  const router = useRouter();
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmation, setConfirmation] = useState<{
    supplierId: number;
    supplierName: string;
    action: "deactivate" | "reactivate";
  } | null>(null);

  const allSuppliers = [...activeSuppliers, ...inactiveSuppliers];
  const filteredSuppliers = allSuppliers.filter((supplier) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const searchableText = [
      supplier.supplier_name,
      supplier.supplier_contact_number,
      String(supplier.supplier_id),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  const visibleSuppliers = filteredSuppliers.filter((supplier) =>
    showInactive ? supplier.isActive === false : supplier.isActive === true,
  );
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(visibleSuppliers.length / itemsPerPage));

  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const paginatedSuppliers = visibleSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDeactivate = async (supplierId: number) => {
    await fetch(`/api/suppliers/${supplierId}`, {
      method: "DELETE",
    });
    setConfirmation(null);
    router.refresh();
  };

  const handleReactivate = async (supplierId: number) => {
    await fetch(`/api/suppliers/${supplierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    setConfirmation(null);
    router.refresh();
  };

  const confirmAction = async () => {
    if (!confirmation) {
      return;
    }

    if (confirmation.action === "deactivate") {
      await handleDeactivate(confirmation.supplierId);
      return;
    }

    await handleReactivate(confirmation.supplierId);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-6 flex gap-2 border-b border-slate-200 sm:mb-0">
          <button
            onClick={() => {
              setShowInactive(false);
              setCurrentPage(1);
            }}
            className={`px-4 py-3 text-sm font-medium transition ${
              !showInactive
                ? "border-b-2 border-sky-500 text-sky-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active Suppliers ({activeSuppliers.length})
          </button>
          <button
            onClick={() => {
              setShowInactive(true);
              setCurrentPage(1);
            }}
            className={`px-4 py-3 text-sm font-medium transition ${
              showInactive
                ? "border-b-2 border-sky-500 text-sky-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Inactive Suppliers ({inactiveSuppliers.length})
          </button>
        </div>

        <div className="flex w-full max-w-md items-center gap-2">
          <label htmlFor="supplier-search" className="sr-only">
            Search supplier
          </label>
          <input
            id="supplier-search"
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search supplier by name, contact, or ID"
            className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {visibleSuppliers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          {searchQuery.trim()
            ? `No suppliers match “${searchQuery.trim()}”. Try a different name or contact number.`
            : showInactive
              ? "No inactive suppliers. All suppliers are active."
              : "No suppliers were found. Add a supplier to start linking items to vendors."}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, visibleSuppliers.length)}-{Math.min(currentPage * itemsPerPage, visibleSuppliers.length)} of {visibleSuppliers.length} suppliers
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedSuppliers.map((supplier) => (
              <div
              key={supplier.supplier_id}
              className={`rounded-3xl border p-6 shadow-sm ${
                showInactive
                  ? "border-slate-200 bg-slate-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-500">ID: {supplier.supplier_id}</p>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    showInactive
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {showInactive ? "Inactive" : "Active"}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{supplier.supplier_name}</h2>
              <p className="mt-3 text-sm text-slate-600">Contact: {supplier.supplier_contact_number}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">Created {supplier.created_at.toISOString().split("T")[0]}</p>
              <div className="mt-5 flex justify-end gap-2">
                {!showInactive && (
                  <>
                    <Link
                      href={`/inventoryDashboard/suppliers/${supplier.supplier_id}/edit`}
                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmation({
                          supplierId: supplier.supplier_id,
                          supplierName: supplier.supplier_name,
                          action: "deactivate",
                        })
                      }
                      className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Deactivate
                    </button>
                  </>
                )}
                {showInactive && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmation({
                        supplierId: supplier.supplier_id,
                        supplierName: supplier.supplier_name,
                        action: "reactivate",
                      })
                    }
                    className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-9 min-w-9 rounded-full border px-3 text-sm font-medium transition ${
                      currentPage === pageNumber
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Confirm action
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {confirmation.action === "deactivate" ? "Deactivate supplier?" : "Reactivate supplier?"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close confirmation"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {confirmation.action === "deactivate"
                ? `This will deactivate ${confirmation.supplierName}. You can reactivate it later from the inactive supplier list.`
                : `This will reactivate ${confirmation.supplierName} and make it visible in the active supplier list again.`}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium text-white transition ${
                  confirmation.action === "deactivate"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {confirmation.action === "deactivate" ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
