import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { AdminDashboard, type AdminUser } from "@/components/dashboard/admin-dashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const payload = verifyToken(token);

    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      redirect("/login");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true },
    });

    if (!currentUser || currentUser.role !== "admin") {
      redirect("/inventoryDashboard");
    }
  } catch {
    redirect("/login");
  }

  const users: AdminUser[] = (await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
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

      <AdminDashboard users={users} />
    </main>
  );
}
