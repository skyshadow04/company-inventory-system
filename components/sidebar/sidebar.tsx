"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/inventoryDashboard", label: "Dashboard" },
  { href: "/inventoryDashboard/products", label: "Products" },
  { href: "/inventoryDashboard/suppliers", label: "Suppliers" },
  { href: "/inventoryDashboard/items", label: "Items" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 border-r bg-white p-5">
      <h1 className="text-xl font-bold">Inventory System</h1>

      <nav className="mt-8 space-y-3 text-sm text-slate-700">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-sky-100 font-semibold text-sky-700 ring-1 ring-sky-200"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}