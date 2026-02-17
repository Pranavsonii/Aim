const THEME_KEY = "theme";
const THEMES = ["light", "dark", "system"];

export function getTheme() {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem(THEME_KEY) || "system";
}

export function setTheme(value) {
  if (!THEMES.includes(value)) return;
  localStorage.setItem(THEME_KEY, value);
  applyTheme(value);
}

export function applyTheme(value) {
  if (typeof document === "undefined") return;
  const effective = value === "system" ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value;
  if (effective === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export const themeScript = `(function(){var k='theme';var t=localStorage.getItem(k)||'system';var d=document.documentElement;var dark=(t==='dark')||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)d.classList.add('dark');else d.classList.remove('dark');})();`;
