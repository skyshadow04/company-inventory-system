"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as XLSX from "xlsx";
import { FileText } from "lucide-react";

export type AssetRecord = {
  asset_id: number;
  asset_name: string;
  asset_serial_number: string;
  asset_owner: string;
  asset_status: string;
  asset_type: string;
  asset_image_link: string | null;
};

type AssetHistoryRecord = {
  asset_history_id: number;
  asset_history_date: string;
  action: string;
  asset_owner: string;
  asset_status: string;
  user: { name: string; email: string };
};

interface AssetDashboardProps {
  assets: AssetRecord[];
  isAdmin: boolean;
  selectedEntity?: string;
  initialPage?: number;
}

export function AssetDashboard({ assets, isAdmin, selectedEntity, initialPage = 1 }: AssetDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [historyAsset, setHistoryAsset] = useState<AssetRecord | null>(null);
  const [history, setHistory] = useState<AssetHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!historyAsset) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHistoryAsset(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [historyAsset]);

  const ownerOptions = useMemo(() => {
    const owners = Array.from(new Set(assets.map((asset) => asset.asset_owner))).sort((a, b) =>
      a.localeCompare(b),
    );

    return owners;
  }, [assets]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(assets.map((asset) => asset.asset_status))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return assets.filter((asset) => {
      const searchableText = [
        asset.asset_name,
        asset.asset_owner,
        asset.asset_type,
        asset.asset_serial_number,
        String(asset.asset_id),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || searchableText.includes(query);
      const matchesOwner = selectedOwner === "all" || asset.asset_owner === selectedOwner;
      const matchesStatus = selectedStatus === "all" || asset.asset_status === selectedStatus;

      return matchesQuery && matchesOwner && matchesStatus;
    });
  }, [assets, searchQuery, selectedOwner, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAssets = filteredAssets.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const handleExport = () => {
    if (filteredAssets.length === 0) {
      return;
    }

    const worksheetData = filteredAssets.map((asset) => ({
      ID: asset.asset_id,
      Name: asset.asset_name,
      SerialNumber: asset.asset_serial_number || "",
      Owner: asset.asset_owner,
      Status: asset.asset_status,
      Type: asset.asset_type,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");
    XLSX.writeFile(workbook, "assets.xlsx");
  };

  const handleShowHistory = async (asset: AssetRecord) => {
    setHistoryAsset(asset);
    setHistory([]);
    setHistoryError(null);
    setHistoryLoading(true);

    try {
      const response = await fetch(`/api/assets/${asset.asset_id}/history`);
      const data = (await response.json()) as { history?: AssetHistoryRecord[]; message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Unable to load asset history.");
      }

      setHistory(data.history || []);
    } catch (error: unknown) {
      setHistoryError(error instanceof Error ? error.message : "Unable to load asset history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-md items-center gap-2">
            <label htmlFor="asset-search" className="sr-only">
              Search assets
            </label>
            <input
              id="asset-search"
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search asset by name, owner, type, or ID"
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
            disabled={filteredAssets.length === 0}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Export XLSX
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Owner</span>
            <select
              value={selectedOwner}
              onChange={(event) => {
                setSelectedOwner(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Status</span>
            <select
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          {(selectedOwner !== "all" || selectedStatus !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedOwner("all");
                setSelectedStatus("all");
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

      {filteredAssets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          {searchQuery.trim()
            ? `No assets match “${searchQuery.trim()}”. Try a different name, owner, or asset type.`
            : "No assets were found. Add your first asset to see it appear here."}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-600">
            Showing {Math.min((safeCurrentPage - 1) * itemsPerPage + 1, filteredAssets.length)}-{Math.min(safeCurrentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedAssets.map((asset) => (
              <div
                key={asset.asset_id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
              >
                {asset.asset_image_link ? (
                  <div className="relative h-48 w-full bg-slate-100">
                    <Image src={asset.asset_image_link} alt={asset.asset_name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <p className="text-sm text-slate-500">No image</p>
                  </div>
                )}

                <div className="space-y-3 p-6">
                  <div>
                    <p className="text-sm text-slate-500">ID: {asset.asset_id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{asset.asset_name}</h2>
                  </div>

                  <p className="text-sm text-slate-600">Owner: {asset.asset_owner}</p>
                  <p className="text-sm text-slate-600">Status: {asset.asset_status}</p>
                  <p className="text-sm text-slate-600">Type: {asset.asset_type}</p>
                  {asset.asset_serial_number ? (
                    <p className="text-sm text-slate-600">Serial: {asset.asset_serial_number}</p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {isAdmin && (
                      <Link
                        href={`/inventoryDashboard/assets/${asset.asset_id}/handover?${new URLSearchParams(selectedEntity ? { entity: selectedEntity } : {}).toString()}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Handover PDF
                      </Link>
                    )}
                    {isAdmin && (
                      <>
                        <Link
                          href={`/inventoryDashboard/assets/${asset.asset_id}/edit?${new URLSearchParams({ ...(selectedEntity ? { entity: selectedEntity } : {}), page: String(safeCurrentPage) }).toString()}`}
                          className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleShowHistory(asset)}
                          className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          History
                        </button>
                      </>
                    )}
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

      {historyAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setHistoryAsset(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-history-title"
            className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">Asset History</p>
                <h2 id="asset-history-title" className="mt-2 text-xl font-semibold text-slate-900">
                  {historyAsset.asset_name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ID: {historyAsset.asset_id} | Current owner: {historyAsset.asset_owner}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryAsset(null)}
                aria-label="Close asset history"
                className="rounded-lg px-3 py-2 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(85vh-130px)] overflow-y-auto p-6">
              {historyLoading ? (
                <p className="py-8 text-center text-sm text-slate-500">Loading history...</p>
              ) : historyError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{historyError}</p>
              ) : history.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No history recorded for this asset.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-3 font-semibold">Date</th>
                        <th className="px-3 py-3 font-semibold">Action</th>
                        <th className="px-3 py-3 font-semibold">Owner</th>
                        <th className="px-3 py-3 font-semibold">Status</th>
                        <th className="px-3 py-3 font-semibold">Changed by</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {history.map((entry) => (
                        <tr key={entry.asset_history_id}>
                          <td className="whitespace-nowrap px-3 py-4">{new Date(entry.asset_history_date).toLocaleString()}</td>
                          <td className="px-3 py-4 font-medium capitalize">{entry.action}</td>
                          <td className="px-3 py-4">{entry.asset_owner}</td>
                          <td className="px-3 py-4">{entry.asset_status}</td>
                          <td className="px-3 py-4">
                            <div>{entry.user.name}</div>
                            <div className="text-xs text-slate-500">{entry.user.email}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
