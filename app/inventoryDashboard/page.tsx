import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assetAccessFilter, getCurrentUser, hasAdminAccess, isSuperAdmin, selectedEntityFilter } from "@/lib/entityAccess";
import { EntityFilter } from "@/components/entity-filter";
import { InventoryBreakdownChart } from "@/components/dashboard/inventory-breakdown-chart";

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

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedYear = String(resolvedSearchParams.year ?? "all");
  const selectedMonth = String(resolvedSearchParams.month ?? "all");
  const selectedEntity = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : undefined;
  const isAdmin = hasAdminAccess(currentUser);
  const superAdmin = isSuperAdmin(currentUser);
  const entityOptions = superAdmin
    ? (await prisma.user.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } })).map((user) => user.entity)
    : [];
  const recordFilter = selectedEntityFilter(currentUser, selectedEntity);
  const assetFilter = assetAccessFilter(currentUser, selectedEntity);

  const [assets, suppliers, items, printers, assetTypeBreakdown, itemTypeBreakdown] = await Promise.all([
    prisma.assets.findMany({
      where: assetFilter,
      orderBy: {
        asset_id: "desc",
      },
    }),
    prisma.supplier.findMany({
      where: recordFilter,
      orderBy: {
        supplier_name: "asc",
      },
    }),
    isAdmin ? prisma.items.findMany({
      where: recordFilter,
      orderBy: {
        item_delivery_date: "desc",
      },
    }) : Promise.resolve([]),
    isAdmin ? prisma.printer.findMany({
      where: recordFilter,
      include: {
        toners: {
          orderBy: { toner_name: "asc" },
        },
        drums: {
          orderBy: { drum_name: "asc" },
        },
      },
      orderBy: { printer_name: "asc" },
    }) : Promise.resolve([]),
    prisma.assets.groupBy({
      where: assetFilter,
      by: ["asset_type"],
      _count: {
        asset_id: true,
      },
    }),
    isAdmin ? prisma.items.groupBy({
      where: recordFilter,
      by: ["item_type"],
      _count: {
        item_id: true,
      },
    }) : Promise.resolve([]),
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
        {superAdmin && <EntityFilter entities={entityOptions} selectedEntity={selectedEntity || ""} />}
      </div>

      <div className={`grid gap-5 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Total Assets
          </h2>
          <p className="mt-4 text-4xl font-bold text-slate-900">{assets.length}</p>
          <InventoryBreakdownChart
            data={assetTypeBreakdown.map((type) => ({
              label: type.asset_type,
              count: type._count.asset_id,
            }))}
            color="var(--color-sky-600)"
            emptyMessage="No asset types available."
          />
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

        {isAdmin && <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Expenses
          </h2>
          <p className="mt-4 text-4xl font-bold text-slate-900">
            {currencyFormatter.format(totalExpenses)}
          </p>

          <form method="get" className="mt-4 space-y-3">
            <input type="hidden" name="entity" value={selectedEntity || ""} />
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
        </div>}
      </div>

      {isAdmin && <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Items by Type</h2>
          <InventoryBreakdownChart
            data={itemTypeBreakdown.map((type) => ({
              label: type.item_type,
              count: type._count.item_id,
            }))}
            color="var(--color-violet-600)"
            emptyMessage="No item types recorded."
          />
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
      </div>}

      {isAdmin && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Toner stock</h2>
            <p className="mt-1 text-sm text-slate-500">Use the toner code when preparing your next order.</p>
          </div>
          <span className="text-sm text-slate-500">
            {printers.reduce((total, printer) => total + printer.toners.length, 0)} toner types
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Printer</th>
                <th className="px-3 py-3 font-medium">Toner</th>
                <th className="px-3 py-3 font-medium">Toner code</th>
                <th className="px-3 py-3 text-right font-medium">Stock</th>
                <th className="px-3 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {printers.flatMap((printer) => printer.toners.map((toner) => (
                <tr key={toner.toner_id}>
                  <td className="px-3 py-3 font-medium text-slate-800">{printer.printer_name}</td>
                  <td className="px-3 py-3 text-slate-600">{toner.toner_name}</td>
                  <td className="px-3 py-3 font-mono text-slate-700">{toner.toner_code}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">{toner.toner_quantity}</td>
                  <td className="px-3 py-3 text-right">
                    {toner.toner_quantity === 0 ? (
                      <span className="font-semibold text-red-600">Order</span>
                    ) : (
                      <span className="text-emerald-600">In stock</span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
          {printers.every((printer) => printer.toners.length === 0) && (
            <p className="py-8 text-center text-sm text-slate-400">No toner records available.</p>
          )}
        </div>
      </section>}

      {isAdmin && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Drum stock</h2>
            <p className="mt-1 text-sm text-slate-500">Review drum codes and identify drums that need ordering.</p>
          </div>
          <span className="text-sm text-slate-500">
            {printers.reduce((total, printer) => total + printer.drums.length, 0)} drum types
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Printer</th>
                <th className="px-3 py-3 font-medium">Drum</th>
                <th className="px-3 py-3 font-medium">Drum code</th>
                <th className="px-3 py-3 text-right font-medium">Stock</th>
                <th className="px-3 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {printers.flatMap((printer) => printer.drums.map((drum) => (
                <tr key={drum.drum_id}>
                  <td className="px-3 py-3 font-medium text-slate-800">{printer.printer_name}</td>
                  <td className="px-3 py-3 text-slate-600">{drum.drum_name}</td>
                  <td className="px-3 py-3 font-mono text-slate-700">{drum.drum_code}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">{drum.drum_quantity}</td>
                  <td className="px-3 py-3 text-right">
                    {drum.drum_quantity === 0 ? (
                      <span className="font-semibold text-red-600">Order</span>
                    ) : (
                      <span className="text-emerald-600">In stock</span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
          {printers.every((printer) => printer.drums.length === 0) && (
            <p className="py-8 text-center text-sm text-slate-400">No drum records available.</p>
          )}
        </div>
      </section>}
    </div>
  );
}