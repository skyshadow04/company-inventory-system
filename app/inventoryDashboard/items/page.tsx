import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Items } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function ItemsDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    verifyToken(token);
  } catch {
    redirect("/login");
  }

  const items: Items[] = await prisma.items.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      item_id: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Inventory Items</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Items Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Review your inventory items and supplier associations.</p>
        </div>
        <Link href="/inventoryDashboard/items/addItem" className="inline-flex rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">Add New Item</Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          No items were found. Add your first inventory item to see it appear here.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: Items) => (
            <div key={item.item_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">ID: {item.item_id}</p>
                  <h2 className="text-xl font-semibold text-slate-900">{item.item_name}</h2>
                  <p className="mt-1 text-sm text-slate-500">Code: {item.item_code || "N/A"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{item.item_type}</span>
              </div>
              <p className="text-sm text-slate-600">Price: {item.item_price}</p>
              <p className="text-sm text-slate-600">Quantity: {item.item_quantity}</p>
              {/* <p className="text-sm text-slate-600">Supplier: {item.supplier?.supplier_name ?? "Unknown"}</p> */}
              {item.item_description ? <p className="mt-3 text-sm text-slate-600">{item.item_description}</p> : null}
              <p className="mt-3 text-sm text-slate-500">Delivery date: {item.item_delivery_date.toISOString().split("T")[0]}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
