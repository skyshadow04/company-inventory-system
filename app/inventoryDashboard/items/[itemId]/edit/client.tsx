"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SupplierOption {
  supplier_id: number;
  supplier_name: string;
}

interface ItemData {
  item_id: number;
  item_name: string;
  item_serial_number: string;
  item_code: string;
  item_type: string;
  item_quantity: number;
  item_price: string;
  item_description: string;
  item_file_link: string;
  item_file_photo_link: string;
  item_delivery_date: string;
  supplier_id: number;
}

function getFileNameFromUrl(url: string) {
  if (!url) {
    return "";
  }

  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? url);
  } catch {
    return url;
  }
}

interface EditItemClientProps {
  itemId: string;
}

export default function EditItemClient({ itemId }: EditItemClientProps) {
  const router = useRouter();
  const itemIdNumber = Number(itemId);

  const [itemName, setItemName] = useState("");
  const [itemSerialNumber, setItemSerialNumber] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemDeliveryDate, setItemDeliveryDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [itemPhoto, setItemPhoto] = useState<File | null>(null);
  const [removeItemFile, setRemoveItemFile] = useState(false);
  const [removeItemPhoto, setRemoveItemPhoto] = useState(false);
  const [currentItemFileLink, setCurrentItemFileLink] = useState("");
  const [currentItemPhotoLink, setCurrentItemPhotoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const res = await fetch("/api/suppliers");
        if (!res.ok) {
          throw new Error("Could not load suppliers.");
        }

        const data = await res.json();
        setSuppliers(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to fetch suppliers.");
      }
    }

    async function loadItem() {
      try {
        const res = await fetch(`/api/items/${itemIdNumber}`);
        if (!res.ok) {
          throw new Error("Item not found.");
        }

        const data = (await res.json()) as ItemData;
        setItemName(data.item_name || "");
        setItemSerialNumber(data.item_serial_number || "");
        setItemCode(data.item_code || "");
        setItemType(data.item_type || "");
        setItemQuantity(Number(data.item_quantity) || 0);
        setItemPrice(String(data.item_price ?? ""));
        setItemDescription(data.item_description || "");
        setSupplierId(String(data.supplier_id || ""));
        setCurrentItemFileLink(data.item_file_link || "");
        setCurrentItemPhotoLink(data.item_file_photo_link || "");
        setItemDeliveryDate(
          data.item_delivery_date ? new Date(data.item_delivery_date).toISOString().slice(0, 10) : "",
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load item details.");
      } finally {
        setFetching(false);
      }
    }

    void loadSuppliers();
    if (!Number.isNaN(itemIdNumber)) {
      void loadItem();
    }
  }, [itemIdNumber]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("item_name", itemName);
      formData.append("item_serial_number", itemSerialNumber);
      formData.append("item_code", itemCode);
      formData.append("item_type", itemType);
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

      if (removeItemFile) {
        formData.append("remove_item_file", "true");
      }

      if (removeItemPhoto) {
        formData.append("remove_item_photo", "true");
      }

      const res = await fetch(`/api/items/${itemIdNumber}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to update item.");
        return;
      }

      setMessage("Item updated successfully.");
      router.push("/inventoryDashboard/items");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">Loading item details...</div>
      </main>
    );
  }

  const photoPreview = itemPhoto ? URL.createObjectURL(itemPhoto) : currentItemPhotoLink;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 font-mono">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Edit Inventory Item</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Update item details</h1>
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

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Item Type</span>
            <Input value={itemType} onChange={(e) => setItemType(e.target.value)} placeholder="e.g. Furniture" required />
          </label>
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
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Current Document</span>
            {currentItemFileLink ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <a href={currentItemFileLink} target="_blank" rel="noreferrer" className="font-medium text-sky-700 underline">
                  {getFileNameFromUrl(currentItemFileLink)}
                </a>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">No document uploaded.</p>
            )}
            <input
              type="file"
              onChange={(e) => setItemFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {currentItemFileLink && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={removeItemFile} onChange={(e) => setRemoveItemFile(e.target.checked)} />
                Remove current document
              </label>
            )}
            {itemFile && <p className="text-xs text-slate-600 mt-1">New file selected: {itemFile.name}</p>}
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Current Photo</span>
            {photoPreview ? (
              <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image src={photoPreview} alt={itemName || "Item preview"} fill className="object-cover" />
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">No photo uploaded.</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setItemPhoto(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {currentItemPhotoLink && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={removeItemPhoto} onChange={(e) => setRemoveItemPhoto(e.target.checked)} />
                Remove current photo
              </label>
            )}
            {itemPhoto && <p className="text-xs text-slate-600 mt-1">New photo selected: {itemPhoto.name}</p>}
          </div>
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
          <Button type="submit" disabled={loading} className="rounded-3xl px-6 py-3">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/inventoryDashboard/items")} className="rounded-3xl px-6 py-3">
            Back
          </Button>
        </div>
      </form>
    </main>
  );
}
