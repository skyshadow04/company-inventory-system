"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SupplierOption {
  supplier_id: number;
  supplier_name: string;
}

export default function AddInventoryItemPage() {
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [description, setDescription] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(false);
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
      } catch (err: any) {
        setError(err?.message || "Unable to fetch suppliers.");
      }
    }

    loadSuppliers();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName, itemCode, category, quantity, unitPrice, supplierId, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to add item.");
        return;
      }

      setMessage("Item created successfully.");
      setItemName("");
      setItemCode("");
      setCategory("");
      setQuantity(0);
      setUnitPrice("");
      setSupplierId("");
      setDescription("");
    } catch (err: any) {
      setError(err?.message || "Network error");
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
            <span className="text-sm font-medium text-slate-700">Item Code</span>
            <Input value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="e.g. CHR-1024" required />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Furniture" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Quantity</span>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="0" min={0} />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Unit Price</span>
            <Input type="text" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="e.g. 149.99" />
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
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
        </div>
      </form>
    </main>
  );
}
