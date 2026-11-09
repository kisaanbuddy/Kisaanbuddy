"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl font-black text-emerald-600 mb-2">404</span>
      <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        The agricultural advisory or tool page you are looking for does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
      >
        <Home className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
