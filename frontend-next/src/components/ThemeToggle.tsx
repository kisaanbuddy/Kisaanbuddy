"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9 rounded-xl border border-border/20 bg-background/20" />
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-xl bg-background/40 border border-border/40 hover:bg-accent/40 hover:border-primary/20 hover:shadow-glow-primary active:scale-90 transition-all duration-300 relative h-9 w-9 flex items-center justify-center backdrop-blur-sm"
      title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      <Sun className="h-4 w-4 text-amber-500 transition-all duration-500 scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 text-emerald-400 transition-all duration-500 scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
