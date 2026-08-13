"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidSupplierContact, SUPPLIER_PHONE_ERROR_MESSAGE } from "@/lib/supplierValidation";

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = Number(params?.supplierId);

  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSupplier() {
      try {
        const res = await fetch(`/api/suppliers/${supplierId}`);
        if (!res.ok) {
          throw new Error("Supplier not found");
        }

        const supplier = await res.json();
        setSupplierName(supplier.supplier_name || "");
        setSupplierContact(supplier.supplier_contact_number || "");
      } catch {
        setError("Unable to load supplier details.");
      } finally {
        setFetching(false);
      }
    }

    if (!Number.isNaN(supplierId)) {
      loadSupplier();
    }
  }, [supplierId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedContact = supplierContact.trim();

    if (!supplierName.trim()) {
      setError("Supplier name is required.");
      setLoading(false);
      return;
    }

    if (!isValidSupplierContact(trimmedContact)) {
      setError(SUPPLIER_PHONE_ERROR_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierName: supplierName.trim(),
          supplierContact: trimmedContact,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Unable to update supplier.");
        return;
      }

      router.push("/inventoryDashboard/suppliers");
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">Loading supplier details...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Edit Supplier</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Update supplier details</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Supplier Name</label>
            <Input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="Supplier name" required />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Contact Number</label>
            <Input value={supplierContact} onChange={(event) => setSupplierContact(event.target.value)} placeholder="+971552345678" required />
          </div>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="rounded-3xl px-6 py-3">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/inventoryDashboard/suppliers")} className="rounded-3xl px-6 py-3">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
