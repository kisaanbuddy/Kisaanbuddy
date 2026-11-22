"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the original error available to browser monitoring without exposing
    // implementation details in the farmer-facing fallback.
    console.error("Dashboard render error:", error);
  }, [error]);

  return (
    <section
      className="mx-auto flex min-h-[52vh] max-w-xl items-center justify-center px-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30">
        <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-amber-600 dark:text-amber-400" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Dashboard needs a refresh</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your farm records are safe. Please try loading the dashboard again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </section>
  );
}
