"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * If an admin request comes back 401 the cookie has expired or was cleared.
 * Bounce to the login page (middleware would do it on the next navigation, this
 * does it immediately).
 */
export function useAdminSessionGuard(status: number | null) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== 401) return;
    router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);
}
