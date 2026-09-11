import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminAccess } from "@/lib/entityAccess";
import HandoverPreview from "./preview";

export default async function AssetHandoverPage({
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
  const entity = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : "";

  if (!Number.isInteger(assetId)) {
    redirect("/inventoryDashboard/assets");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Asset Handover</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Review handover PDF</h1>
          <p className="mt-2 text-sm text-slate-600">Check the completed form before downloading it.</p>
        </div>
        <Link
          href={`/inventoryDashboard/assets${entity ? `?entity=${encodeURIComponent(entity)}` : ""}`}
          className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Assets
        </Link>
      </div>

      <HandoverPreview assetId={assetId} entity={entity} />
    </main>
  );
}