"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}><ThemeBrowserColor />{children}</NextThemesProvider>
}

function ThemeBrowserColor() {
  const { resolvedTheme } = useTheme()
  React.useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', resolvedTheme === 'dark' ? '#101814' : '#ffffff'
    )
  }, [resolvedTheme])
  return null
}
