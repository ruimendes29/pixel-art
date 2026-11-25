// Light/dark theme. The default follows the operating system; picking Light or
// Dark overrides it and is remembered in localStorage. The chosen theme is put
// on <html data-theme="…">, which selects one of the two variable maps in
// index.css. public/index.html runs the same steps before the first paint so
// the page never flashes the wrong theme.
import { useSyncExternalStore } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
const CHANGE_EVENT = "themechange";

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** Saved choice; anything missing or unknown means "follow the system". */
export const parsePreference = (value: string | null): ThemePreference =>
  value === "light" || value === "dark" ? value : "system";

export const resolveTheme = (preference: ThemePreference, systemDark: boolean): Theme =>
  preference === "system" ? (systemDark ? "dark" : "light") : preference;

// localStorage can throw (private mode, blocked storage): fall back to the system
export const readPreference = (): ThemePreference => {
  try {
    return parsePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
};

const apply = () => {
  const theme = resolveTheme(readPreference(), systemQuery().matches);
  if (document.documentElement.dataset.theme !== theme) {
    document.documentElement.dataset.theme = theme;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const setThemePreference = (preference: ThemePreference) => {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // not saved, but still applied for this visit
  }
  apply();
};

/** Applies the theme now and keeps following the system while no choice is saved. */
export const initTheme = () => {
  apply();
  systemQuery().addEventListener("change", apply);
};

/** Calls `callback` whenever the shown theme or the preference changes. */
export const onThemeChange = (callback: () => void) => {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
};

export const useThemePreference = () =>
  useSyncExternalStore(onThemeChange, readPreference);
