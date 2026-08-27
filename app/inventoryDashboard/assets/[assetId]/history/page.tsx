import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasAdminAccess, selectedEntityFilter } from "@/lib/entityAccess";

export default async function AssetHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ assetId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!hasAdminAccess(currentUser)) {
    redirect("/inventoryDashboard/assets");
  }

  const assetId = Number((await params).assetId);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const returnQuery = new URLSearchParams();
  const entity = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : "";
  const page = typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1";

  if (entity) {
    returnQuery.set("entity", entity);
  }
  returnQuery.set("page", page);

  if (!Number.isInteger(assetId)) {
    redirect("/inventoryDashboard/assets");
  }

  const asset = await prisma.assets.findFirst({
    where: { asset_id: assetId, ...selectedEntityFilter(currentUser, "all") },
    select: {
      asset_id: true,
      asset_name: true,
      asset_serial_number: true,
      asset_owner: true,
      asset_status: true,
      asset_type: true,
    },
  });

  if (!asset) {
    redirect("/inventoryDashboard/assets");
  }

  const history = await prisma.assetHistory.findMany({
    where: { asset_id: assetId, ...selectedEntityFilter(currentUser, "all") },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { asset_history_date: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Asset History</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">{asset.asset_name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            ID: {asset.asset_id} | Owner: {asset.asset_owner} | Status: {asset.asset_status}
          </p>
        </div>
        <Link
          href={`/inventoryDashboard/assets?${returnQuery.toString()}`}
          className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Assets
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          No history recorded for this asset.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Changed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {history.map((entry) => (
                <tr key={entry.asset_history_id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    {entry.asset_history_date.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium capitalize">{entry.action}</td>
                  <td className="px-6 py-4">{entry.asset_owner}</td>
                  <td className="px-6 py-4">{entry.asset_status}</td>
                  <td className="px-6 py-4">
                    <div>{entry.user.name}</div>
                    <div className="text-xs text-slate-500">{entry.user.email}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
