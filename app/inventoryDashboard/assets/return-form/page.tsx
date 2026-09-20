import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/entityAccess";
import ReturnFormPreview from "./preview";

export default async function AssetReturnFormPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const assetIds = typeof resolvedSearchParams.assetIds === "string" ? resolvedSearchParams.assetIds : "";
  const userId = typeof resolvedSearchParams.userId === "string" ? resolvedSearchParams.userId : "";

  if (!assetIds || !/^\d+(,\d+)*$/.test(assetIds) || (userId && !/^\d+$/.test(userId))) {
    redirect("/inventoryDashboard/assets");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Asset Return</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Review return form</h1>
          <p className="mt-2 text-sm text-slate-600">Check the completed form before printing or downloading it.</p>
        </div>
        <Link
          href="/inventoryDashboard/assets"
          className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Assets
        </Link>
      </div>

      <ReturnFormPreview assetIds={assetIds} userId={userId} />
    </main>
  );
}