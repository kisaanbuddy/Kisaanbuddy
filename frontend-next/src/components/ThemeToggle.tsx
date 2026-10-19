"use client"
import { useLanguage } from '@/lib/language'

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-8 w-8 rounded-lg border border-border/70 bg-card/60" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-1.5 rounded-lg bg-card/60 border border-border/70 hover:bg-muted/60 hover:text-foreground active:scale-95 transition-all duration-200 relative h-8 w-8 flex items-center justify-center cursor-pointer"
      title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      aria-label={t("theme_toggle.toggle_theme")}
    >
      <Sun className="h-4 w-4 text-amber-500 transition-all duration-300 scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 text-emerald-400 transition-all duration-300 scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("theme_toggle.toggle_theme")}</span>
    </button>
  );
}
