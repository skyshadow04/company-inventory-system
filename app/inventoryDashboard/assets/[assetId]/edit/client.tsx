"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AssetData {
  asset_id: number;
  asset_name: string;
  asset_serial_number: string;
  asset_owner: string;
  asset_status: string;
  asset_type: string;
  asset_image_link: string;
}

interface EditAssetClientProps {
  assetId: string;
}

export default function EditAssetClient({ assetId }: EditAssetClientProps) {
  const router = useRouter();
  const assetIdNumber = Number(assetId);

  const [assetName, setAssetName] = useState("");
  const [assetSerialNumber, setAssetSerialNumber] = useState("");
  const [assetOwner, setAssetOwner] = useState("");
  const [assetStatus, setAssetStatus] = useState("Used");
  const [assetType, setAssetType] = useState("");
  const [assetImage, setAssetImage] = useState<File | null>(null);
  const [currentAssetImage, setCurrentAssetImage] = useState("");
  const [removeAssetImage, setRemoveAssetImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAsset() {
      try {
        const res = await fetch(`/api/assets/${assetIdNumber}`);
        if (!res.ok) {
          throw new Error("Asset not found.");
        }

        const data = (await res.json()) as AssetData;
        setAssetName(data.asset_name || "");
        setAssetSerialNumber(data.asset_serial_number || "");
        setAssetOwner(data.asset_owner || "");
        setAssetStatus(data.asset_status || "Used");
        setAssetType(data.asset_type || "");
        setCurrentAssetImage(data.asset_image_link || "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load asset details.");
      } finally {
        setFetching(false);
      }
    }

    if (!Number.isNaN(assetIdNumber)) {
      void loadAsset();
    }
  }, [assetIdNumber]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

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

      if (removeAssetImage) {
        formData.append("remove_asset_image", "true");
      }

      const res = await fetch(`/api/assets/${assetIdNumber}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to update asset.");
        return;
      }

      router.push("/inventoryDashboard/assets");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">Loading asset details...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 font-mono">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Edit Asset</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Update asset details</h1>
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
            {currentAssetImage && !removeAssetImage && !imagePreview ? (
              <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image src={currentAssetImage} alt={assetName || "Asset preview"} fill className="object-cover" />
              </div>
            ) : imagePreview ? (
              <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image src={imagePreview} alt="Asset preview" fill className="object-cover" />
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">No image uploaded.</p>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setAssetImage(file);
                setImagePreview(file ? URL.createObjectURL(file) : null);
                setRemoveAssetImage(false);
              }}
              className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />

            {currentAssetImage && (
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={removeAssetImage} onChange={(e) => setRemoveAssetImage(e.target.checked)} />
                Remove current image
              </label>
            )}
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={loading} className="rounded-3xl px-6 py-3">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/inventoryDashboard/assets")} className="rounded-3xl px-6 py-3">
            Back
          </Button>
        </div>
      </form>
    </main>
  );
}
