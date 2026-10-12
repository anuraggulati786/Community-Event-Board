"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiClientError, apiGet, errorMessage } from "@/lib/api/client";

/**
 * Small GET hook. It keeps the previous payload on screen while a new query is
 * in flight, so changing a filter never blanks the page:
 *
 *   isLoading    -> there is nothing to show yet (render skeletons)
 *   isRefreshing -> new data is on the way, old data still visible
 */
export type UseApiResult<T> = {
  data: T | null;
  meta: Record<string, unknown> | undefined;
  error: string | null;
  status: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refetch: () => void;
  setData: (updater: T | ((current: T | null) => T)) => void;
};

export function useApi<T>(path: string | null, options?: { enabled?: boolean }): UseApiResult<T> {
  const enabled = options?.enabled ?? true;

  const [data, setDataState] = useState<T | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(path) && enabled);
  const [reloadKey, setReloadKey] = useState(0);

  const requestId = useRef(0);

  useEffect(() => {
    if (!path || !enabled) {
      setIsLoading(false);
      return;
    }

    const currentRequest = ++requestId.current;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    apiGet<T>(path, controller.signal)
      .then((envelope) => {
        if (currentRequest !== requestId.current) return;
        setDataState(envelope.data);
        setMeta(envelope.meta);
        setStatus(200);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || currentRequest !== requestId.current) return;
        setError(errorMessage(caught));
        setStatus(caught instanceof ApiClientError ? caught.status : null);
      })
      .finally(() => {
        if (currentRequest !== requestId.current) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [path, enabled, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  const setData = useCallback((updater: T | ((current: T | null) => T)) => {
    setDataState((current) =>
      typeof updater === "function" ? (updater as (value: T | null) => T)(current) : updater,
    );
  }, []);

  return {
    data,
    meta,
    error,
    status,
    isLoading,
    isRefreshing: isLoading && data !== null,
    refetch,
    setData,
  };
}
