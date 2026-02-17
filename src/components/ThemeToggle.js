"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { getTheme, setTheme, applyTheme } from "@/lib/theme.js";

export default function ThemeToggle() {
  const [theme, setThemeState] = useState("system");

  useEffect(() => {
    setThemeState(getTheme());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme(getTheme());
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const handleSelect = (value) => {
    setTheme(value);
    setThemeState(value);
  };

  const base =
    "h-8 w-8 rounded-lg border flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 outline-none";
  const active = "border-foreground bg-accent text-accent-foreground";
  const inactive = "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <div
      className="inline-flex w-fit rounded-lg border border-border bg-background p-1"
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => handleSelect("light")}
        className={`${base} ${theme === "light" ? active : inactive}`}
        aria-label="Light theme"
        title="Light"
      >
        <Sun size={16} />
      </button>
      <button
        type="button"
        onClick={() => handleSelect("dark")}
        className={`${base} ${theme === "dark" ? active : inactive} mx-1`}
        aria-label="Dark theme"
        title="Dark"
      >
        <Moon size={16} />
      </button>
      <button
        type="button"
        onClick={() => handleSelect("system")}
        className={`${base} ${theme === "system" ? active : inactive}`}
        aria-label="System theme"
        title="System"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
}
