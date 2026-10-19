"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, getStoredUser } from "@/lib/auth";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/farmer-profile",
  "/soil-health",
  "/khet-diary",
  "/settings",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Blocks protected UI until the cookie-backed server session has been restored. */
export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, ready } = useAuth();
  const protectedRoute = isProtectedPath(pathname);

  useEffect(() => {
    if (protectedRoute && ready && !user) {
      // If storage still holds a cached user session, restoration may still be resolving
      const cached = getStoredUser();
      if (cached) return;

      const timer = setTimeout(() => {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, protectedRoute, ready, router, user]);

  if (protectedRoute && (!ready || !user)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Restoring your secure session…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
