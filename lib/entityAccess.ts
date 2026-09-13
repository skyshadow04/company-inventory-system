import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUser() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);

    if (typeof payload !== "object" || payload === null || typeof payload.id !== "number") {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, role: true, entity: true },
    });
  } catch {
    return null;
  }
}

export function entityFilter(user: { role: string; entity: string }) {
  return { entity: user.entity };
}

export function isAdminUser(user: { role: string }) {
  return ["admin", "super admin", "super_admin"].includes(user.role.trim().toLowerCase());
}

export function isSuperAdmin(user: { role: string; entity: string }) {
  const role = user.role.trim().toLowerCase().replace(/_/g, " ");
  return role === "super admin" && user.entity.trim().toLowerCase() === "admin";
}

export function selectedEntityFilter(
  user: { role: string; entity: string },
  selectedEntity?: string,
) {
  if (isSuperAdmin(user) && !selectedEntity) {
    return { entity: "__entity_selection_required__" };
  }

  if (isSuperAdmin(user) && selectedEntity && selectedEntity !== "all") {
    return { entity: selectedEntity };
  }

  return isSuperAdmin(user) ? {} : entityFilter(user);
}

export function assetAccessFilter(
  user: { role: string; entity: string; name: string },
  selectedEntity?: string,
) {
  if (isAdminUser(user)) {
    return selectedEntityFilter(user, selectedEntity);
  }

  return { entity: user.entity, asset_owner: user.name };
}

export function hasAdminAccess(user: { role: string }) {
  return isAdminUser(user);
}