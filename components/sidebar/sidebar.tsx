"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/inventoryDashboard", label: "Dashboard" },
  { href: "/inventoryDashboard/assets", label: "Assets" },
  { href: "/inventoryDashboard/suppliers", label: "Suppliers" },
  { href: "/inventoryDashboard/items", label: "Items" },
  { href: "/inventoryDashboard/etisalatbill", label: "Etisalat Bills" },
  { href: "/inventoryDashboard/admin", label: "Admin", adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUserRole() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();

        if (!mounted) {
          return;
        }

        const role = String(data?.user?.role || "").trim().toLowerCase().replace(/_/g, " ");
        setIsAdmin(role === "admin" || role === "super admin");
      } catch {
        if (mounted) {
          setIsAdmin(false);
        }
      }
    }

    loadUserRole();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Menu className="size-5" />
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 md:hidden"
          aria-label="Close navigation menu"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 h-screen w-64 border-r bg-white p-5 shadow-xl transition-transform duration-200 md:static md:z-auto md:block md:translate-x-0 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Inventory System</h1>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-3 text-sm text-slate-700">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
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
    </>
  );
}