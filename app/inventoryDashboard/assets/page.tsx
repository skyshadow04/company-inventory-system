import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

type AssetRecord = Awaited<ReturnType<typeof prisma.assets.findMany>>[number];

export default async function AssetsPage() {
  const assets: AssetRecord[] = await prisma.assets.findMany({
    orderBy: {
      asset_id: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Assets</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Assets Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">View and manage your inventory assets.</p>
        </div>
        <Link href="/inventoryDashboard/assets/addAsset" className="inline-flex rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
          Add Asset
        </Link>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          No assets were found. Add your first asset to see it appear here.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset: AssetRecord) => (
            <div
              key={asset.asset_id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
            >
              {asset.asset_image_link ? (
                <div className="relative h-48 w-full bg-slate-100">
                  <Image src={asset.asset_image_link} alt={asset.asset_name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <p className="text-sm text-slate-500">No image</p>
                </div>
              )}

              <div className="space-y-3 p-6">
                <div>
                  <p className="text-sm text-slate-500">ID: {asset.asset_id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">{asset.asset_name}</h2>
                </div>

                <p className="text-sm text-slate-600">Owner: {asset.asset_owner}</p>
                <p className="text-sm text-slate-600">Status: {asset.asset_status}</p>
                <p className="text-sm text-slate-600">Type: {asset.asset_type}</p>
                {asset.asset_serial_number ? <p className="text-sm text-slate-600">Serial: {asset.asset_serial_number}</p> : null}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Link href={`/inventoryDashboard/assets/${asset.asset_id}/edit`} className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
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
