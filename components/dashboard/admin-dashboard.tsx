"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type AdminUser = {
  id: number;
  name: string;
  image_link: string;
  company_number: string | null;
  email: string;
  role: string;
  entity: string;
  isActive: boolean;
  createdAt: string;
};

interface AdminDashboardProps {
  users: AdminUser[];
  currentUserEntity: string;
  canManageEntities: boolean;
}

const OTHER_ENTITY = "__other__";

export function AdminDashboard({ users, currentUserEntity, canManageEntities }: AdminDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [customEntity, setCustomEntity] = useState("");
  const [form, setForm] = useState({
    name: "",
    company_number: "",
    email: "",
    role: "staff",
    entity: currentUserEntity,
    password: "",
    confirmPassword: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roleOptions = useMemo(() => {
    return Array.from(new Set(users.map((user) => user.role))).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const entityOptions = useMemo(() => {
    return Array.from(new Set(users.map((user) => user.entity))).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const searchableText = [user.name, user.email, user.role, String(user.id)].join(" ").toLowerCase();
      const matchesQuery = !query || searchableText.includes(query);
      const matchesRole = selectedRole === "all" || user.role === selectedRole;

      return matchesQuery && matchesRole;
    });
  }, [searchQuery, selectedRole, users]);
  const usersPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * usersPerPage,
    safeCurrentPage * usersPerPage,
  );

  const openEditModal = (user: AdminUser) => {
    setIsCreatingUser(false);
    setEditingUser(user);
    const existingEntity = entityOptions.includes(user.entity) ? user.entity : OTHER_ENTITY;
    setCustomEntity(existingEntity === OTHER_ENTITY ? user.entity : "");
    setForm({
      name: user.name,
      company_number: user.company_number || "",
      email: user.email,
      role: user.role,
      entity: existingEntity,
      password: "",
      confirmPassword: "",
      isActive: user.isActive,
    });
    setError(null);
    setSuccess(null);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setIsCreatingUser(true);
    setCustomEntity("");
    setError(null);
    setSuccess(null);
    setForm({
      name: "",
      company_number: "",
      email: "",
      role: "staff",
      entity: canManageEntities ? entityOptions[0] || currentUserEntity : currentUserEntity,
      password: "",
      confirmPassword: "",
      isActive: true,
    });
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsCreatingUser(false);
    setCustomEntity("");
    setError(null);
    setSuccess(null);
    setForm({
      name: "",
      company_number: "",
      email: "",
      role: "staff",
      entity: canManageEntities ? entityOptions[0] || currentUserEntity : currentUserEntity,
      password: "",
      confirmPassword: "",
      isActive: true,
    });
  };

  const handleSave = async () => {
    if (!editingUser && !isCreatingUser) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (isCreatingUser && !form.password.trim()) {
        setError("Password is required.");
        setSaving(false);
        return;
      }

      if (form.password.trim() !== form.confirmPassword) {
        setError("Passwords do not match.");
        setSaving(false);
        return;
      }

      const resolvedEntity = canManageEntities
        ? form.entity === OTHER_ENTITY
          ? customEntity.trim()
          : form.entity.trim()
        : currentUserEntity;

      if (!resolvedEntity) {
        setError("Please specify an entity.");
        setSaving(false);
        return;
      }

      const payload: Record<string, string | boolean> = {
        name: form.name.trim(),
        company_number: form.company_number.trim(),
        email: form.email.trim(),
        role: form.role,
        entity: resolvedEntity,
        isActive: form.isActive,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (isCreatingUser) {
        payload.confirmPassword = form.confirmPassword.trim();
      }

      const res = await fetch(
        isCreatingUser ? "/api/admin/users" : `/api/admin/users/${editingUser?.id}`,
        {
        method: isCreatingUser ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Unable to update user.");
      }

      setSuccess(isCreatingUser ? "User created successfully." : "User updated successfully.");
      router.refresh();
      closeModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isCreatingUser ? "Creation failed." : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full max-w-xl items-center gap-2">
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <input
            id="user-search"
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search users by name, email, role, or ID"
            className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Role</span>
          <select
            value={selectedRole}
            onChange={(event) => {
              setSelectedRole(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500"
        >
          Add user
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
          {searchQuery || selectedRole !== "all"
            ? "No users match the selected filters."
            : "No users were found."}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={user.image_link}
                    alt={`${user.name}'s profile`}
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                  <p className="text-sm text-slate-500">User ID: {user.id}</p>
                  <h2 className="mt-1 truncate text-xl font-semibold text-slate-900">{user.name}</h2>
                  </div>
                </div>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                  {user.role}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Email: {user.email}</p>
                <p>Entity: {user.entity}</p>
                <p>Created: {new Date(user.createdAt).toLocaleDateString("en-US")}</p>
                <p>
                  Status:{" "}
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.isActive ? "Active" : "Deactivated"}
                  </span>
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredUsers.length > 0 && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safeCurrentPage === 1}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setCurrentPage(pageNumber)}
              className={`h-9 min-w-9 rounded-full border px-3 text-sm font-medium transition ${
                safeCurrentPage === pageNumber
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safeCurrentPage === totalPages}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {(editingUser || isCreatingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {isCreatingUser ? "New user" : "Manage user"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {isCreatingUser ? "Add user" : "Edit user details"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close user modal"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Entity</span>
                {canManageEntities ? (
                  <select
                    value={form.entity}
                    onChange={(event) => setForm((current) => ({ ...current, entity: event.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  >
                    {entityOptions.map((entity) => (
                      <option key={entity} value={entity}>
                        {entity}
                      </option>
                    ))}
                    <option value={OTHER_ENTITY}>Other</option>
                  </select>
                ) : (
                  <input
                    readOnly
                    value={currentUserEntity}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                )}
                {canManageEntities && form.entity === OTHER_ENTITY && (
                  <input
                    value={customEntity}
                    onChange={(event) => setCustomEntity(event.target.value)}
                    placeholder="Please specify the entity"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                )}
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Company contact number (optional)</span>
                <input
                  type="tel"
                  value={form.company_number}
                  onChange={(event) => setForm((current) => ({ ...current, company_number: event.target.value }))}
                  placeholder="e.g. +1 555 123 4567"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Role</span>
                <select
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  {isCreatingUser ? "Password" : "New password (optional)"}
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder={isCreatingUser ? "Enter a password" : "Leave blank to keep the current password"}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Confirm password</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  placeholder={isCreatingUser ? "Re-enter the password" : "Re-enter the new password"}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="flex items-center space-x-3 rounded-xl border border-slate-300 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 outline-none transition focus:ring-2 focus:ring-sky-400"
                />
                <span className="text-sm font-medium text-slate-700">Account is active</span>
              </label>
              {!form.isActive && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  ⚠️ Unchecking this will deactivate the account. The user will not be able to login.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? "Saving..." : isCreatingUser ? "Create user" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
