import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currencyFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parsePrice(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const numericValue = Number(value.replace(/[^0-9.-]+/g, ""));

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
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

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedYear = String(resolvedSearchParams.year ?? "all");
  const selectedMonth = String(resolvedSearchParams.month ?? "all");

  const [assets, suppliers, items, assetTypeBreakdown, itemTypeBreakdown] = await Promise.all([
    prisma.assets.findMany({
      orderBy: {
        asset_id: "desc",
      },
    }),
    prisma.supplier.findMany({
      orderBy: {
        supplier_name: "asc",
      },
    }),
    prisma.items.findMany({
      orderBy: {
        item_delivery_date: "desc",
      },
    }),
    prisma.assets.groupBy({
      by: ["asset_type"],
      _count: {
        asset_id: true,
      },
    }),
    prisma.items.groupBy({
      by: ["item_type"],
      _count: {
        item_id: true,
      },
    }),
  ]);

  const filteredItems = items.filter((item) => {
    const deliveryDate = new Date(item.item_delivery_date);
    const itemYear = String(deliveryDate.getFullYear());
    const itemMonth = String(deliveryDate.getMonth() + 1);

    const matchesYear = selectedYear === "all" || itemYear === selectedYear;
    const matchesMonth = selectedMonth === "all" || itemMonth === selectedMonth;

    return matchesYear && matchesMonth;
  });

  const totalExpenses = filteredItems.reduce((sum, item) => {
    const itemQuantity = Math.max(0, Number(item.item_quantity ?? 0));
    return sum + parsePrice(item.item_price) * itemQuantity;
  }, 0);

  const yearOptions = Array.from(
    new Set(items.map((item) => new Date(item.item_delivery_date).getFullYear())),
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Total Assets
          </h2>
          <p className="mt-4 text-4xl font-bold text-slate-900">{assets.length}</p>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {assetTypeBreakdown.length > 0 ? (
              assetTypeBreakdown.map((type) => (
                <div key={type.asset_type} className="flex items-center justify-between gap-3">
                  <span>{type.asset_type}</span>
                  <span className="rounded-full bg-sky-100 px-2 py-1 font-semibold text-sky-700">
                    {type._count.asset_id}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No asset types available.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Total Suppliers
          </h2>
          <p className="mt-4 text-4xl font-bold text-slate-900">{suppliers.length}</p>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {suppliers.length > 0 ? (
              suppliers.slice(0, 6).map((supplier) => (
                <div key={supplier.supplier_id} className="flex items-center justify-between gap-3">
                  <span>{supplier.supplier_name}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
              ))
            ) : (
              <p className="text-slate-400">No suppliers available.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Expenses
          </h2>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {currencyFormatter.format(totalExpenses)}
          </p>

          <form method="get" className="mt-4 space-y-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="expense-year" className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Year
              </label>
              <select
                id="expense-year"
                name="year"
                defaultValue={selectedYear}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="all">All years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="expense-month" className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Month
              </label>
              <select
                id="expense-month"
                name="month"
                defaultValue={selectedMonth}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="all">All months</option>
                {monthNames.map((month, index) => (
                  <option key={month} value={String(index + 1)}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Apply filter
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Items by Type</h2>
          <div className="mt-4 space-y-3">
            {itemTypeBreakdown.length > 0 ? (
              itemTypeBreakdown.map((type) => (
                <div key={type.item_type} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="font-medium text-slate-700">{type.item_type}</span>
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-sm font-semibold text-violet-700">
                    {type._count.item_id}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No item types recorded.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Expense Summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Selected period</span>
              <span className="font-medium text-slate-800">
                {selectedYear === "all" ? "All years" : selectedYear} / {selectedMonth === "all" ? "All months" : monthNames[Number(selectedMonth) - 1]}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Matching item records</span>
              <span className="font-medium text-slate-800">{filteredItems.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Total expense</span>
              <span className="font-semibold text-slate-900">
                {currencyFormatter.format(totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}