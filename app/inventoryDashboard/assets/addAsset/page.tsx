"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddAssetPage() {
  const router = useRouter();
  const [assetName, setAssetName] = useState("");
  const [assetSerialNumber, setAssetSerialNumber] = useState("");
  const [assetOwner, setAssetOwner] = useState("");
  const [assetStatus, setAssetStatus] = useState("Used");
  const [assetType, setAssetType] = useState("");
  const [assetImage, setAssetImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("asset_name", assetName);
      formData.append("asset_serial_number", assetSerialNumber);
      formData.append("asset_owner", assetOwner);
      formData.append("asset_status", assetStatus);
      formData.append("asset_type", assetType);

      if (assetImage) {
        formData.append("asset_image", assetImage);
      }

      const res = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to add asset.");
        return;
      }

      setMessage("Asset created successfully.");
      setAssetName("");
      setAssetSerialNumber("");
      setAssetOwner("");
      setAssetStatus("Used");
      setAssetType("");
      setAssetImage(null);
      setImagePreview(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 font-mono">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Add Asset</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create a new asset</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Asset Name</span>
            <Input value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="e.g. Dell Laptop" required />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Serial Number</span>
            <Input value={assetSerialNumber} onChange={(e) => setAssetSerialNumber(e.target.value)} placeholder="e.g. DL-12345" />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Owner</span>
            <Input value={assetOwner} onChange={(e) => setAssetOwner(e.target.value)} placeholder="e.g. HR Department" required />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Asset Type</span>
            <Input value={assetType} onChange={(e) => setAssetType(e.target.value)} placeholder="e.g. Laptop" required />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              value={assetStatus}
              onChange={(e) => setAssetStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="Used">Used</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Damaged">Damaged</option>
            </select>
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Asset Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setAssetImage(file);
                setImagePreview(file ? URL.createObjectURL(file) : null);
              }}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {imagePreview && (
              <div className="relative mt-2 h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image src={imagePreview} alt="Asset preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={loading} className="rounded-3xl px-6 py-3">
            {loading ? "Saving..." : "Save Asset"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/inventoryDashboard/assets")} className="rounded-3xl px-6 py-3">
            Back
          </Button>
        </div>
      </form>
    </main>
  );
}
