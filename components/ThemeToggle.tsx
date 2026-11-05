"use client";

import { useSyncExternalStore } from "react";
import { THEMES, THEME_STORAGE_KEY, applyTheme, isTheme, type Theme } from "@/lib/theme";

const LABELS: Record<Theme, string> = { light: "Light", dark: "Dark", system: "System" };
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    // Storage can be blocked (private mode); fall back to following the system.
    return "system";
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function choose(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Still apply for this page view even if it cannot be remembered.
  }
  applyTheme(theme, document.documentElement);
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  // The server cannot know the saved choice, so it renders "system" and the client corrects it.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);
  return (
    <div role="radiogroup" aria-label="Color theme" className="flex gap-1">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={theme === option}
          onClick={() => choose(option)}
          className={`rounded px-2 py-1 text-xs ${
            theme === option ? "bg-foreground text-background" : "border border-line hover:opacity-70"
          }`}
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  );
}
