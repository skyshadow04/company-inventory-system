"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidSupplierContact, SUPPLIER_PHONE_ERROR_MESSAGE } from "@/lib/supplierValidation";

export default function AddSupplierPage() {
  const router = useRouter();
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const trimmedContact = supplierContact.trim();

    if (!isValidSupplierContact(trimmedContact)) {
      setError(SUPPLIER_PHONE_ERROR_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierName, supplierContact: `+971${trimmedContact}` }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Unable to create supplier.");
        return;
      }

      setMessage("Supplier added successfully.");
      setSupplierName("");
      setSupplierContact("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Add Supplier</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create a new supplier</h1>
          <p className="mt-2 text-sm text-slate-600">Add supplier contact details so inventory items can be linked to vendors.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Supplier Name</label>
            <Input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="Supplier name" required />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Contact Number</label>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">+971</span>
              <Input
                type="tel"
                value={supplierContact}
                onChange={(event) => setSupplierContact(event.target.value)}
                placeholder="55 123 4567"
                title="Enter UAE phone number without +971 prefix"
                required
              />
            </div>
          </div>

          {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="rounded-3xl px-6 py-3">{loading ? "Saving..." : "Save Supplier"}</Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/inventoryDashboard/suppliers")} className="rounded-3xl px-6 py-3">
              Back
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
