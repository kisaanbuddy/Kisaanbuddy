"use client"
import { useLanguage } from '@/lib/language'

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { t } = useLanguage()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-8 w-8 rounded-lg border border-border/70 bg-card/60" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-1.5 rounded-lg bg-card/80 border border-border/70 hover:bg-muted/80 hover:text-foreground active:scale-95 transition-all duration-200 relative h-8 w-8 flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
      title={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={resolvedTheme === "dark"}
      aria-label={t("theme_toggle.toggle_theme")}
    >
      <Sun className="h-4 w-4 text-amber-500 transition-all duration-300 scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 text-emerald-400 transition-all duration-300 scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("theme_toggle.toggle_theme")}</span>
    </button>
  );
}
