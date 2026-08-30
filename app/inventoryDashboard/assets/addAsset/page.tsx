"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddAssetPage() {
  const router = useRouter();
  const [assetName, setAssetName] = useState("");
  const [assetSerialNumber, setAssetSerialNumber] = useState("");
  const [assetOwner, setAssetOwner] = useState("");
  const [customAssetOwner, setCustomAssetOwner] = useState("");
  const [assetStatus, setAssetStatus] = useState("Used");
  const [assetType, setAssetType] = useState("");
  const [customAssetType, setCustomAssetType] = useState("");
  const [assetOwnerOptions, setAssetOwnerOptions] = useState<string[]>([]);
  const [assetTypeOptions, setAssetTypeOptions] = useState<string[]>([]);
  const [assetImage, setAssetImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"upload" | "reuse">("upload");
  const [copyFromAssetId, setCopyFromAssetId] = useState("");
  const [availableAssets, setAvailableAssets] = useState<Array<{ asset_id: number; asset_name: string; asset_image_link: string }>>([]);
  const [selectedAssetPreview, setSelectedAssetPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();

        if (!mounted) {
          return;
        }

        const role = String(data?.user?.role || "").trim().toLowerCase().replace(/_/g, " ");
        if (!data?.user || (role !== "admin" && role !== "super admin")) {
          router.replace("/inventoryDashboard/assets");
        }
      } catch {
        if (mounted) {
          router.replace("/inventoryDashboard/assets");
        }
      }
    }

    async function loadAssetTypes() {
      try {
        const [assetsResponse, usersResponse] = await Promise.all([
          fetch("/api/assets"),
          fetch("/api/admin/users"),
        ]);
        if (!assetsResponse.ok || !usersResponse.ok) {
          return;
        }

        const data = (await assetsResponse.json()) as Array<{ asset_type?: string; asset_id?: number; asset_name?: string; asset_image_link?: string }>;
        const users = (await usersResponse.json()) as Array<{ name?: string; entity?: string }>;
        const authResponse = await fetch("/api/auth/me", { credentials: "include" });
        const authData = await authResponse.json();
        const currentEntity = String(authData?.user?.entity || "");
        const uniqueOwners = Array.from(
          new Set(
            users
              .filter((user) => user.entity === currentEntity)
              .map((user) => user.name)
              .filter((name): name is string => Boolean(name?.trim())),
          ),
        ).sort((a, b) => a.localeCompare(b));
        const uniqueTypes = Array.from(
          new Set(
            data
              .map((record) => record.asset_type)
              .filter((type): type is string => Boolean(type && type.trim())),
          ),
        ).sort((a, b) => a.localeCompare(b));

        if (mounted) {
          setAssetOwnerOptions(uniqueOwners);
          setAssetTypeOptions(uniqueTypes);
          // Filter assets with images for reuse
          const assetsWithImages = data
            .filter((asset) => asset.asset_image_link && asset.asset_image_link.trim())
            .map((asset) => ({
              asset_id: asset.asset_id || 0,
              asset_name: asset.asset_name || "Unknown",
              asset_image_link: asset.asset_image_link || "",
            }));
          setAvailableAssets(assetsWithImages);
        }
      } catch {
        if (mounted) {
          setAssetTypeOptions([]);
        }
      }
    }

    void checkAccess();
    void loadAssetTypes();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      const finalAssetOwner = assetOwner === "Other" ? customAssetOwner.trim() : assetOwner;
      const finalAssetType = assetType === "Other" ? customAssetType.trim() : assetType;
      formData.append("asset_name", assetName);
      formData.append("asset_serial_number", assetSerialNumber);
      formData.append("asset_owner", finalAssetOwner);
      formData.append("asset_status", assetStatus);
      formData.append("asset_type", finalAssetType);

      if (imageMode === "reuse" && copyFromAssetId) {
        formData.append("copy_from_asset_id", copyFromAssetId);
      } else if (imageMode === "upload" && assetImage) {
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

      router.push(`/inventoryDashboard/assets?entity=${encodeURIComponent(String(data?.entity || ""))}`);
      setMessage("Asset created successfully.");
      setAssetName("");
      setAssetSerialNumber("");
      setAssetOwner("");
      setCustomAssetOwner("");
      setAssetStatus("Used");
      setAssetType("");
      setCustomAssetType("");
      setAssetImage(null);
      setImagePreview(null);
      setImageMode("upload");
      setCopyFromAssetId("");
      setSelectedAssetPreview("");
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
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Owner</span>
            <select
              value={assetOwner}
              onChange={(e) => setAssetOwner(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select asset owner</option>
              {assetOwnerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {assetOwner === "Other" && (
              <Input
                value={customAssetOwner}
                onChange={(e) => setCustomAssetOwner(e.target.value)}
                placeholder="Please specify the asset owner"
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Asset Type</span>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select asset type</option>
              {[...assetTypeOptions, "Other"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {assetType === "Other" && (
              <Input
                value={customAssetType}
                onChange={(e) => setCustomAssetType(e.target.value)}
                placeholder="Please specify the asset type"
                required
              />
            )}
          </div>
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
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageMode"
                    value="upload"
                    checked={imageMode === "upload"}
                    onChange={() => {
                      setImageMode("upload");
                      setCopyFromAssetId("");
                      setSelectedAssetPreview("");
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Upload New Image</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageMode"
                    value="reuse"
                    checked={imageMode === "reuse"}
                    onChange={() => setImageMode("reuse")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Reuse Existing Image</span>
                </label>
              </div>

              {imageMode === "upload" ? (
                <>
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
                </>
              ) : (
                <>
                  <select
                    value={copyFromAssetId}
                    onChange={(e) => {
                      const assetId = e.target.value;
                      setCopyFromAssetId(assetId);
                      const selectedAsset = availableAssets.find((asset) => asset.asset_id === Number(assetId));
                      setSelectedAssetPreview(selectedAsset?.asset_image_link || "");
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select an asset with image</option>
                    {availableAssets.map((asset) => (
                      <option key={asset.asset_id} value={asset.asset_id}>
                        {asset.asset_name}
                      </option>
                    ))}
                  </select>
                  {selectedAssetPreview && (
                    <div className="relative mt-2 h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <Image src={selectedAssetPreview} alt="Selected asset image" fill className="object-cover" />
                    </div>
                  )}
                </>
              )}
            </div>
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
