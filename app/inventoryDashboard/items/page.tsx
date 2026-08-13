import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type ItemWithSupplier = Prisma.ItemsGetPayload<{
  include: {
    supplier: true;
  };
}>;

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

  const items: ItemWithSupplier[] = await prisma.items.findMany({
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
          {items.map((item: ItemWithSupplier) => (
            <div key={item.item_id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {item.item_file_photo_link ? (
                <div className="relative h-48 w-full bg-slate-100">
                  <Image
                    src={item.item_file_photo_link}
                    alt={item.item_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <p className="text-sm text-slate-500">No photo</p>
                </div>
              )}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">ID: {item.item_id}</p>
                    <h2 className="text-xl font-semibold text-slate-900">{item.item_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">Code: {item.item_code || "N/A"}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{item.item_type}</span>
                </div>
                <p className="text-sm text-slate-600">Supplier: {item.supplier?.supplier_name || "Unknown supplier"}</p>
                <p className="text-sm text-slate-600">Price: {item.item_price}</p>
                <p className="text-sm text-slate-600">Quantity: {item.item_quantity}</p>
                {item.item_description ? <p className="mt-3 text-sm text-slate-600">{item.item_description}</p> : null}
                <p className="mt-3 text-sm text-slate-500">Delivery date: {item.item_delivery_date.toISOString().split("T")[0]}</p>
                
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                  {item.item_file_link && (
                    <a
                      href={item.item_file_link}
                      download
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>📄</span>
                      Download
                    </a>
                  )}

                  <Link
                    href={`/inventoryDashboard/items/${item.item_id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
