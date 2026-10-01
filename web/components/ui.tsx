import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warn";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-bg-elev-2 text-fg-muted border-border",
    accent: "bg-accent/10 text-accent border-accent/30",
    success: "bg-accent-2/10 text-accent-2 border-accent-2/30",
    warn: "bg-warn/10 text-warn border-warn/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-bg-elev shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-fg-muted">{description}</p>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-border bg-bg-elev p-6 text-sm text-fg-muted"
    >
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent"
      />
      {label}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-bg-elev p-5">
      <div className="h-4 w-1/3 rounded bg-bg-elev-2" />
      <div className="mt-3 h-3 w-2/3 rounded bg-bg-elev-2" />
      <div className="mt-6 h-8 w-1/2 rounded bg-bg-elev-2" />
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-bg-elev-2" />
        <div className="h-5 w-16 rounded-full bg-bg-elev-2" />
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger/40 bg-danger/5 p-6"
    >
      <h3 className="text-sm font-semibold text-danger">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-border bg-bg-elev px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-bg-elev p-10 text-center">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">{message}</p>
    </div>
  );
}

/** Non-blocking notice shown when read-only views fell back to bundled data. */
export function FallbackNotice() {
  return (
    <div className="rounded-lg border border-warn/30 bg-warn/5 px-4 py-2 text-xs text-fg-muted">
      <span className="font-semibold text-warn">Offline mode:</span> showing
      bundled synthetic data because the API was unreachable. Start the Python
      API for live figures.
    </div>
  );
}
