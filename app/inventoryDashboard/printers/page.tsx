import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasAdminAccess, isSuperAdmin, selectedEntityFilter } from "@/lib/entityAccess";
import { EntityFilter } from "@/components/entity-filter";
import { PrintersDashboard, type PrinterRecord } from "@/components/dashboard/printers-dashboard";

const printerInclude = { toners: true, drums: true } satisfies Prisma.PrinterInclude;

export default async function PrintersPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login");

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!hasAdminAccess(currentUser)) redirect("/inventoryDashboard/assets");

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedEntity = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : undefined;
  const entityOptions = isSuperAdmin(currentUser)
    ? (await prisma.user.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } })).map((user) => user.entity)
    : [];
  const printers = await prisma.printer.findMany({
    where: selectedEntityFilter(currentUser, selectedEntity),
    include: printerInclude,
    orderBy: { printer_id: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Printer inventory</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Printers</h1>
        <p className="mt-2 text-sm text-slate-600">Track printer identifiers and compatible consumable stock.</p>
      </div>
      {isSuperAdmin(currentUser) && <EntityFilter entities={entityOptions} selectedEntity={selectedEntity || ""} />}
      <PrintersDashboard initialPrinters={printers as PrinterRecord[]} entity={selectedEntity || currentUser.entity} />
    </main>
  );
}
