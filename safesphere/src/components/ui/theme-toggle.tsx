"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved theme or system preference
    const saved = localStorage.getItem("safesphere-theme") as "light" | "dark" | null;
    const initial = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(newTheme: "light" | "dark") {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("safesphere-theme", next);
    applyTheme(next);
  }

  if (!mounted) {
    return (
      <div className={`size-9 rounded-xl border border-line bg-surface ${className}`} aria-hidden />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`btn btn-secondary size-9 p-0 rounded-xl transition-all ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={16} className="text-slate-700 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
