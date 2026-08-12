import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 border-r bg-white p-5">
      <h1 className="text-xl font-bold">Inventory System</h1>

      <nav className="mt-8 space-y-3 text-sm text-slate-700">
        <Link href="/inventoryDashboard" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100">
          Dashboard
        </Link>
        <Link href="/inventoryDashboard/products" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100">
          Products
        </Link>
        <Link href="/inventoryDashboard/suppliers" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100">
          Suppliers
        </Link>
        <Link href="/inventoryDashboard/items" className="block rounded-lg px-3 py-2 transition hover:bg-slate-100 font-medium text-slate-900">
          Items
        </Link>
      </nav>
    </aside>
  );
}