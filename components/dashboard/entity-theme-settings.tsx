"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ENTITY_THEMES, type EntityTheme } from "@/lib/entityTheme";
import { useDashboardTheme } from "./theme-shell";

export function EntityThemeSettings({ initialTheme }: { initialTheme: EntityTheme }) {
  const { theme, setTheme } = useDashboardTheme();
  const [saving, setSaving] = useState(false);

  async function handleThemeChange(nextTheme: EntityTheme) {
    const previousTheme = theme;
    setTheme(nextTheme);
    setSaving(true);

    try {
      const response = await fetch("/api/entity-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextTheme }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to save the theme.");
      }

      window.dispatchEvent(new CustomEvent("entity-theme-updated", { detail: data.theme }));
      toast.success("Entity theme updated");
    } catch (error) {
      setTheme(previousTheme);
      toast.error(error instanceof Error ? error.message : "Unable to save the theme.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">Appearance</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Entity theme</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose the accent color used by everyone in this entity.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ENTITY_THEMES.map((option) => {
          const selected = (theme || initialTheme) === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={saving}
              onClick={() => handleThemeChange(option.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                selected ? "border-sky-500 ring-2 ring-sky-200" : "border-slate-200"
              }`}
              aria-pressed={selected}
            >
              <span className="size-9 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                <span className="block text-xs text-slate-500">{selected ? "Active" : "Use this theme"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
