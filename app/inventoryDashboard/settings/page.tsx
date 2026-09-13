import { redirect } from "next/navigation";
import { EntityThemeSettings } from "@/components/dashboard/entity-theme-settings";
import { getCurrentUser, hasAdminAccess } from "@/lib/entityAccess";
import { prisma } from "@/lib/prisma";
import { isEntityTheme, type EntityTheme } from "@/lib/entityTheme";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasAdminAccess(currentUser)) {
    redirect("/inventoryDashboard");
  }

  const settings = await prisma.entitySettings.findUnique({ where: { entity: currentUser.entity } });
  const initialTheme: EntityTheme = isEntityTheme(settings?.theme) ? settings.theme : "ocean";

  return <EntityThemeSettings initialTheme={initialTheme} />;
}