import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasAdminAccess, isSuperAdmin, selectedEntityFilter } from "@/lib/entityAccess";
import { EntityFilter } from "@/components/entity-filter";
import { AssetDashboard, type AssetRecord } from "@/components/dashboard/assets-dashboard";

export default async function AssetsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
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
  const selectedEntity = String(resolvedSearchParams.entity ?? "all");
  const superAdmin = isSuperAdmin(currentUser);
  const entityOptions = superAdmin
    ? (await prisma.user.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } })).map((user) => user.entity)
    : [];

  const assets: AssetRecord[] = await prisma.assets.findMany({
    where: selectedEntityFilter(currentUser, selectedEntity),
    orderBy: {
      asset_id: "desc",
    },
  });

  const isAdmin = hasAdminAccess(currentUser);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Assets</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Assets Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">View and manage your inventory assets.</p>
        </div>
        {isAdmin && (
          <Link href="/inventoryDashboard/assets/addAsset" className="inline-flex rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
            Add Asset
          </Link>
        )}
      </div>

      {superAdmin && <EntityFilter entities={entityOptions} selectedEntity={selectedEntity} />}

      <AssetDashboard assets={assets} isAdmin={isAdmin} />
    </main>
  );
}
