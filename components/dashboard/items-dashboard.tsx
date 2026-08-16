"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";

export type ItemWithSupplier = Prisma.ItemsGetPayload<{
  include: {
    supplier: true;
  };
}>;

interface ItemsDashboardProps {
  items: ItemWithSupplier[];
}

export function ItemsDashboard({ items }: ItemsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const supplierOptions = useMemo(() => {
    const records = new Map<number, string>();

    items.forEach((item) => {
      const supplierName = item.supplier?.supplier_name || "Unknown supplier";
      records.set(item.supplier_id, supplierName);
    });

    return Array.from(records.entries()).map(([supplierId, supplierName]) => ({
      supplierId,
      supplierName,
    }));
  }, [items]);

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        items.map((item) => new Date(item.item_delivery_date).getFullYear()),
      ),
    );

    return years.sort((a, b) => b - a);
  }, [items]);

  const monthOptions = useMemo(() => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return monthNames.map((month, index) => ({
      value: String(index + 1),
      label: month,
    }));
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const deliveryDate = new Date(item.item_delivery_date);
      const itemYear = String(deliveryDate.getFullYear());
      const itemMonth = String(deliveryDate.getMonth() + 1);
      const supplierName = item.supplier?.supplier_name || "Unknown supplier";
      const matchesQuery =
        !query ||
        [
          item.item_name,
          item.item_code,
          item.item_type,
          supplierName,
          String(item.item_id),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesYear = selectedYear === "all" || itemYear === selectedYear;
      const matchesMonth = selectedMonth === "all" || itemMonth === selectedMonth;
      const matchesSupplier =
        selectedSupplier === "all" || String(item.supplier_id) === selectedSupplier;

      return matchesQuery && matchesYear && matchesMonth && matchesSupplier;
    });
  }, [items, searchQuery, selectedYear, selectedMonth, selectedSupplier]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const handleExport = () => {
    if (filteredItems.length === 0) {
      return;
    }

    const worksheetData = filteredItems.map((item) => {
      const deliveryDate = new Date(item.item_delivery_date);

      return {
        ID: item.item_id,
        Name: item.item_name,
        Code: item.item_code || "",
        Type: item.item_type,
        Quantity: item.item_quantity,
        Price: item.item_price,
        Supplier: item.supplier?.supplier_name || "Unknown supplier",
        SupplierID: item.supplier_id,
        DeliveryDate: deliveryDate.toISOString().split("T")[0],
        DeliveryYear: deliveryDate.getFullYear(),
        DeliveryMonth: deliveryDate.toLocaleString("en-US", { month: "long" }),
        Description: item.item_description || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
    XLSX.writeFile(workbook, "items.xlsx");
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-md items-center gap-2">
            <label htmlFor="item-search" className="sr-only">
              Search items
            </label>
            <input
              id="item-search"
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search item by name, code, supplier, or ID"
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

          <button
            type="button"
            onClick={handleExport}
            disabled={filteredItems.length === 0}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Export XLSX
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Year</span>
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All years</option>
              {yearOptions.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Month</span>
            <select
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All months</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Supplier</span>
            <select
              value={selectedSupplier}
              onChange={(event) => {
                setSelectedSupplier(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All suppliers</option>
              {supplierOptions.map((supplier) => (
                <option key={supplier.supplierId} value={String(supplier.supplierId)}>
                  {supplier.supplierName}
                </option>
              ))}
            </select>
          </label>

          {(selectedYear !== "all" || selectedMonth !== "all" || selectedSupplier !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
                setSelectedSupplier("all");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          {searchQuery.trim()
            ? `No items match “${searchQuery.trim()}”. Try a different keyword or supplier name.`
            : "No items were found. Add your first inventory item to see it appear here."}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-600">
            Showing {Math.min((safeCurrentPage - 1) * itemsPerPage + 1, filteredItems.length)}-{Math.min(safeCurrentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item) => (
              <div
                key={item.item_id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
              >
                {item.item_file_photo_link ? (
                  <div className="relative h-48 w-full bg-slate-100">
                    <Image
                      src={item.item_file_photo_link}
                      alt={item.item_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <p className="text-sm text-slate-500">No photo</p>
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">ID: {item.item_id}</p>
                      <h2 className="text-xl font-semibold text-slate-900">{item.item_name}</h2>
                      <p className="mt-1 text-sm text-slate-500">Code: {item.item_code || "N/A"}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                      {item.item_type}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600">Supplier: {item.supplier?.supplier_name || "Unknown supplier"}</p>
                  <p className="text-sm text-slate-600">Price: {item.item_price}</p>
                  <p className="text-sm text-slate-600">Quantity: {item.item_quantity}</p>
                  {item.item_description ? (
                    <p className="mt-3 text-sm text-slate-600">{item.item_description}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-slate-500">
                    Delivery date: {item.item_delivery_date.toISOString().split("T")[0]}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                    {item.item_file_link && (
                      <a
                        href={item.item_file_link}
                        download
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>📄</span>
                        Download
                      </a>
                    )}

                    <Link
                      href={`/inventoryDashboard/items/${item.item_id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
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
                      safeCurrentPage === pageNumber
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
                disabled={safeCurrentPage === totalPages}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
