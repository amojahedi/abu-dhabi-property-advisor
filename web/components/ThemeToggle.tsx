"use client";

import { useSyncExternalStore } from "react";

/**
 * Dark/light toggle. The active theme lives on <html class="light"> (set before
 * paint by an inline script in the root layout). We read it via
 * useSyncExternalStore so there is no setState-in-effect and no hydration flash:
 * the server snapshot is always "dark" and the client reconciles on mount.
 */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("light");
}

export function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function toggle() {
    const next = !light;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${light ? "dark" : "light"} mode`}
      aria-pressed={light}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-elev text-fg-muted transition-colors hover:text-fg hover:border-accent"
    >
      <span aria-hidden className="text-sm">
        {light ? "☀" : "☾"}
      </span>
    </button>
  );
}
