"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SupplierOption {
  supplier_id: number;
  supplier_name: string;
}

export default function AddInventoryItemPage() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [itemSerialNumber, setItemSerialNumber] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemType, setItemType] = useState("");
  const [customItemType, setCustomItemType] = useState("");
  const [itemTypeOptions, setItemTypeOptions] = useState<string[]>([]);
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [itemPhoto, setItemPhoto] = useState<File | null>(null);
  const [itemDeliveryDate, setItemDeliveryDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();

        if (!mounted) {
          return;
        }

        if (!data?.user || data.user.role !== "admin") {
          router.replace("/inventoryDashboard/items");
        }
      } catch {
        if (mounted) {
          router.replace("/inventoryDashboard/items");
        }
      }
    }

    async function loadSuppliers() {
      try {
        const res = await fetch("/api/suppliers");
        if (!res.ok) {
          throw new Error("Could not load suppliers.");
        }
        const data = await res.json();
        if (mounted) {
          setSuppliers(data);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch suppliers.");
        }
      }
    }

    async function loadItemTypes() {
      try {
        const res = await fetch("/api/items");
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as Array<{ item_type?: string }>;
        const uniqueTypes = Array.from(
          new Set(
            data
              .map((record) => record.item_type)
              .filter((type): type is string => Boolean(type && type.trim())),
          ),
        ).sort((a, b) => a.localeCompare(b));

        if (mounted) {
          setItemTypeOptions(uniqueTypes);
        }
      } catch {
        if (mounted) {
          setItemTypeOptions([]);
        }
      }
    }

    void checkAccess();
    void loadSuppliers();
    void loadItemTypes();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      const finalItemType = itemType === "Other" ? customItemType.trim() : itemType;
      formData.append("item_name", itemName);
      formData.append("item_serial_number", itemSerialNumber);
      formData.append("item_code", itemCode);
      formData.append("item_type", finalItemType);
      formData.append("item_quantity", String(itemQuantity));
      formData.append("item_price", itemPrice);
      formData.append("item_description", itemDescription);
      formData.append("item_delivery_date", itemDeliveryDate);
      formData.append("supplier_id", supplierId);

      if (itemFile) {
        formData.append("item_file", itemFile);
      }
      if (itemPhoto) {
        formData.append("item_photo", itemPhoto);
      }

      const res = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to add item.");
        return;
      }

      setMessage("Item created successfully.");
      setItemName("");
      setItemSerialNumber("");
      setItemCode("");
      setItemType("");
      setCustomItemType("");
      setItemQuantity(0);
      setItemPrice("");
      setItemDescription("");
      setItemFile(null);
      setItemPhoto(null);
      setItemDeliveryDate("");
      setSupplierId("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 font-mono">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Add Inventory Item</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create a new item</h1>
        <p className="mt-2 text-sm text-slate-600">Use this form to add a new inventory item and link it to an existing supplier.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Item Name</span>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Office Chair" required />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Item Serial Number</span>
            <Input value={itemSerialNumber} onChange={(e) => setItemSerialNumber(e.target.value)} placeholder="e.g. SN-12345" />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Item Code</span>
            <Input value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="e.g. CHR-1024" required />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Item Type</span>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select item type</option>
              {[...itemTypeOptions, "Other"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {itemType === "Other" && (
              <Input
                value={customItemType}
                onChange={(e) => setCustomItemType(e.target.value)}
                placeholder="Please specify the item type"
                required
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Quantity</span>
            <Input type="number" value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))} placeholder="0" min={0} />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Item Price</span>
            <Input type="text" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="e.g. 149.99" required />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Document File</span>
            <input
              type="file"
              onChange={(e) => setItemFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {itemFile && <p className="text-xs text-slate-600 mt-1">Selected: {itemFile.name}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Photo File</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setItemPhoto(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {itemPhoto && <p className="text-xs text-slate-600 mt-1">Selected: {itemPhoto.name}</p>}
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Delivery Date</span>
            <Input type="date" value={itemDeliveryDate} onChange={(e) => setItemDeliveryDate(e.target.value)} />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Supplier</span>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.supplier_name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Item Description</span>
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Describe the item, features, and any special handling notes."
            />
          </label>
        </div>

        {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={loading} className="rounded-3xl px-6 py-3">{loading ? "Saving..." : "Save Item"}</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/inventoryDashboard/items")} className="rounded-3xl px-6 py-3">
            Back
          </Button>
        </div>
      </form>
    </main>
  );
}
