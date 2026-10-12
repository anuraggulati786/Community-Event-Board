"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "@/lib/api/client";
import type { UserDTO } from "@/lib/dto";

/** Who is signed in? Loaded once from `GET /api/auth/me` and shared app-wide. */

type Me = { user: UserDTO } | null;

type SessionValue = {
  user: UserDTO | null;
  isLoading: boolean;
  /** True when the user has not picked any favourite categories yet. */
  needsInterests: boolean;
  refresh: () => Promise<void>;
  setUser: (user: UserDTO | null) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const envelope = await apiGet<Me>("/api/auth/me");
      setUser(envelope.data?.user ?? null);
    } catch {
      // A failed "who am I" is not fatal - treat it as signed out.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      isLoading,
      needsInterests: Boolean(user) && (user?.favoriteCategories.length ?? 0) === 0,
      refresh,
      setUser,
      signOut,
    }),
    [user, isLoading, refresh, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside <SessionProvider>");
  return context;
}
