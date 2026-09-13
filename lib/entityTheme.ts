export const ENTITY_THEMES = [
  { id: "ocean", label: "Ocean", color: "#0284c7" },
  { id: "forest", label: "Forest", color: "#059669" },
  { id: "sunset", label: "Sunset", color: "#ea580c" },
  { id: "rose", label: "Rose", color: "#e11d48" },
  { id: "graphite", label: "Graphite", color: "#475569" },
] as const;

export type EntityTheme = (typeof ENTITY_THEMES)[number]["id"];

export function isEntityTheme(value: unknown): value is EntityTheme {
  return typeof value === "string" && ENTITY_THEMES.some((theme) => theme.id === value);
}
