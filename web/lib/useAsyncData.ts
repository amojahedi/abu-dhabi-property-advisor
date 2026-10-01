"use client";

import { useCallback, useEffect, useState } from "react";

export type AsyncStatus = "loading" | "done" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  /** Re-run the loader. */
  reload: () => void;
}

/**
 * Run an async loader on mount (and on dependency change), tracking
 * loading/done/error status without calling setState synchronously inside the
 * effect body — the status only transitions from within the promise callbacks,
 * which keeps the React 19 `set-state-in-effect` lint rule happy.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
): AsyncState<T> {
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    // Kick off asynchronously so the state updates happen in microtasks,
    // not synchronously during the effect.
    Promise.resolve()
      .then(() => {
        if (active) setStatus("loading");
        return loader();
      })
      .then((result) => {
        if (!active) return;
        setData(result);
        setStatus("done");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { status, data, reload };
}
