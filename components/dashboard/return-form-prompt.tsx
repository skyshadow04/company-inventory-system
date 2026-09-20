"use client";

import { Download, X } from "lucide-react";
import { useState } from "react";

export type ReturnFormAsset = {
  asset_id: number;
  asset_name: string;
  asset_serial_number: string;
  asset_owner: string;
  entity: string;
};

export type ReturnFormUser = {
  id: number;
  name: string;
  entity: string;
};

export function ReturnFormPrompt({
  assets,
  users,
  isAdmin,
}: {
  assets: ReturnFormAsset[];
  users: ReturnFormUser[];
  isAdmin: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const selectedUser = users.find((user) => String(user.id) === selectedUserId);
  const selectableAssets = isAdmin && selectedUser
    ? assets.filter((asset) => asset.asset_owner === selectedUser.name && asset.entity === selectedUser.entity)
    : assets;

  function openPrompt() {
    const firstUser = users[0];
    setSelectedUserId(firstUser ? String(firstUser.id) : "");
    const firstUserAssets = isAdmin && firstUser
      ? assets.filter((asset) => asset.asset_owner === firstUser.name && asset.entity === firstUser.entity)
      : assets;
    setSelectedIds(new Set(firstUserAssets.map((asset) => asset.asset_id)));
    setIsOpen(true);
  }

  function handleUserChange(userId: string) {
    setSelectedUserId(userId);
    const user = users.find((candidate) => String(candidate.id) === userId);
    const userAssets = user
      ? assets.filter((asset) => asset.asset_owner === user.name && asset.entity === user.entity)
      : [];
    setSelectedIds(new Set(userAssets.map((asset) => asset.asset_id)));
  }

  function toggleAsset(assetId: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  }

  function reviewForm() {
    if (selectedIds.size === 0) {
      return;
    }

    const params = new URLSearchParams({ assetIds: Array.from(selectedIds).join(",") });
    if (isAdmin && selectedUserId) {
      params.set("userId", selectedUserId);
    }
    window.location.href = `/inventoryDashboard/assets/return-form?${params.toString()}`;
  }

  return (
    <>
      <button
        type="button"
        onClick={openPrompt}
        disabled={assets.length === 0 || (isAdmin && users.length === 0)}
        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="size-4" aria-hidden="true" />
        Create return form
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Return request</p>
                <h2 id="return-form-title" className="mt-2 text-xl font-semibold text-slate-900">
                  Choose assets to return
                </h2>
                <p className="mt-1 text-sm text-slate-600">Choose the user and assets included in this return.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close return form prompt"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="size-5" />
              </button>
            </div>

            {isAdmin && (
              <label className="mt-5 block text-sm font-medium text-slate-700">
                User
                <select
                  value={selectedUserId}
                  onChange={(event) => handleUserChange(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.entity})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="mt-5 max-h-72 space-y-2 overflow-y-auto">
              {selectableAssets.map((asset) => (
                <label
                  key={asset.asset_id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(asset.asset_id)}
                    onChange={() => toggleAsset(asset.asset_id)}
                    className="mt-1 size-4 accent-sky-600"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{asset.asset_name}</span>
                    <span className="block text-xs text-slate-500">
                      Serial: {asset.asset_serial_number || "N/A"}
                    </span>
                  </span>
                </label>
              ))}
              {selectableAssets.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                  No assets are assigned to this user.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={reviewForm}
                  disabled={selectedIds.size === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Review and print
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
