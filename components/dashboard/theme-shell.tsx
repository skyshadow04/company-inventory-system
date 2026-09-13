"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { EntityTheme } from "@/lib/entityTheme";

type ThemeContextValue = {
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  theme: EntityTheme;
  setTheme: (theme: EntityTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useDashboardTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useDashboardTheme must be used inside ThemeShell");
  }

  return context;
}

export function ThemeShell({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: EntityTheme;
}) {
  const [theme, setTheme] = useState<EntityTheme>(initialTheme);
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setDarkModeState(window.localStorage.getItem("inventory-dark-mode") === "true");
    });

    const handleThemeUpdate = (event: Event) => {
      const nextTheme = (event as CustomEvent<EntityTheme>).detail;
      setTheme(nextTheme);
    };

    window.addEventListener("entity-theme-updated", handleThemeUpdate);

    return () => window.removeEventListener("entity-theme-updated", handleThemeUpdate);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const setDarkMode = (enabled: boolean) => {
    setDarkModeState(enabled);
    window.localStorage.setItem("inventory-dark-mode", String(enabled));
  };

  const contextValue = useMemo(
    () => ({ darkMode, setDarkMode, theme, setTheme }),
    [darkMode, theme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`dashboard-theme min-h-screen ${darkMode ? "dark" : ""}`} data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
