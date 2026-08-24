"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidSupplierContact, SUPPLIER_PHONE_ERROR_MESSAGE } from "@/lib/supplierValidation";

export default function AddSupplierPage() {
  const OTHER_ENTITY = "__other__";
  const router = useRouter();
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [entity, setEntity] = useState("");
  const [customEntity, setCustomEntity] = useState("");
  const [entityOptions, setEntityOptions] = useState<string[]>([]);
  const [canManageEntities, setCanManageEntities] = useState(false);
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

        const role = String(data?.user?.role || "").trim().toLowerCase().replace(/_/g, " ");
        if (!data?.user || (role !== "admin" && role !== "super admin")) {
          router.replace("/inventoryDashboard/suppliers");
          return;
        }

        const currentEntity = String(data.user.entity || "");
        const superAdmin = role === "super admin" && currentEntity.toLowerCase() === "admin";
        setCanManageEntities(superAdmin);
        setEntity(currentEntity);

        if (superAdmin) {
          const usersResponse = await fetch("/api/admin/users");
          if (usersResponse.ok) {
            const users = (await usersResponse.json()) as Array<{ entity?: string }>;
            setEntityOptions(Array.from(new Set(users.map((user) => user.entity).filter((value): value is string => Boolean(value?.trim())))).sort((a, b) => a.localeCompare(b)));
          }
        }
      } catch {
        if (mounted) {
          router.replace("/inventoryDashboard/suppliers");
        }
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const trimmedContact = supplierContact.trim();
    const resolvedEntity = canManageEntities
      ? entity === OTHER_ENTITY
        ? customEntity.trim()
        : entity.trim()
      : entity.trim();

    if (!resolvedEntity) {
      setError("Please select an entity.");
      setLoading(false);
      return;
    }

    if (!isValidSupplierContact(trimmedContact)) {
      setError(SUPPLIER_PHONE_ERROR_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierName, supplierContact: `+971${trimmedContact}`, entity: resolvedEntity }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Unable to create supplier.");
        return;
      }

      setMessage("Supplier added successfully.");
      setSupplierName("");
      setSupplierContact("");
      setCustomEntity("");
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
            <label className="block text-sm font-medium text-slate-700">Entity</label>
            {canManageEntities ? (
              <select
                value={entity}
                onChange={(event) => setEntity(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="">Select an entity</option>
                {entityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                <option value={OTHER_ENTITY}>Other</option>
              </select>
            ) : (
              <Input value={entity} readOnly required />
            )}
            {canManageEntities && entity === OTHER_ENTITY && (
              <Input
                value={customEntity}
                onChange={(event) => setCustomEntity(event.target.value)}
                placeholder="Please specify the entity"
                required
              />
            )}
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
