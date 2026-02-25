export type AppTheme = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "theme";

const isAppTheme = (value: string | null): value is AppTheme =>
  value === "system" || value === "light" || value === "dark";

export const getStoredThemePreference = (): AppTheme => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isAppTheme(stored) ? stored : "system";
};

export const getResolvedTheme = (preference: AppTheme): "light" | "dark" => {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyThemePreference = (preference: AppTheme) => {
  const resolved = getResolvedTheme(preference);
  document.documentElement.classList.toggle("dark", resolved === "dark");
};

export const setThemePreference = (preference: AppTheme) => {
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyThemePreference(preference);
  window.dispatchEvent(new CustomEvent("theme-change"));
};

export const initializeTheme = () => {
  applyThemePreference(getStoredThemePreference());
};

