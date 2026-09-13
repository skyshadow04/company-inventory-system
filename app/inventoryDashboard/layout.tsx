import Sidebar from "@/components/sidebar/sidebar";
import { ThemeShell } from "@/components/dashboard/theme-shell";
import { getCurrentUser } from "@/lib/entityAccess";
import { prisma } from "@/lib/prisma";
import { isEntityTheme, type EntityTheme } from "@/lib/entityTheme";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const settings = currentUser
    ? await prisma.entitySettings.findUnique({ where: { entity: currentUser.entity } })
    : null;
  const initialTheme: EntityTheme = isEntityTheme(settings?.theme) ? settings.theme : "ocean";

  return (
    <ThemeShell initialTheme={initialTheme}>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeShell>
  );
}