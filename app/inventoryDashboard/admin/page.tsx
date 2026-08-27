import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasAdminAccess, isSuperAdmin, selectedEntityFilter } from "@/lib/entityAccess";
import { EntityFilter } from "@/components/entity-filter";
import { AdminDashboard, type AdminUser } from "@/components/dashboard/admin-dashboard";

export default async function AdminPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const currentUser = await getCurrentUser();

  if (!currentUser || !hasAdminAccess(currentUser)) {
    redirect("/inventoryDashboard");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedEntity = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : undefined;
  const superAdmin = isSuperAdmin(currentUser);
  const entityOptions = superAdmin
    ? (await prisma.user.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } })).map((user) => user.entity)
    : [];

  const users: AdminUser[] = (await prisma.user.findMany({
    orderBy: { id: "asc" },
    where: selectedEntityFilter(currentUser, selectedEntity),
    select: {
      id: true,
      name: true,
      image_link: true,
      company_number: true,
      email: true,
      role: true,
      entity: true,
      isActive: true,
      createdAt: true,
    },
  })).map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">User management</h1>
          <p className="mt-2 text-sm text-slate-600">Manage user roles and reset passwords for account access.</p>
        </div>
      </div>

      {superAdmin && <EntityFilter entities={entityOptions} selectedEntity={selectedEntity || ""} />}

      <AdminDashboard
        users={users}
        currentUserEntity={currentUser.entity}
        canManageEntities={superAdmin}
      />
    </main>
  );
}
