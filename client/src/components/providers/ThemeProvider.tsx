'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { useLanguageStore } from '@/stores/languageStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, color } = useThemeStore()
  const { language } = useLanguageStore()

  useEffect(() => {
    // Initialize theme on mount
    const root = window.document.documentElement
    
    // Set theme
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
    
    // Set color
    root.classList.remove('theme-green', 'theme-blue', 'theme-purple', 'theme-orange', 'theme-red')
    root.classList.add(`theme-${color}`)
    
    // Set language
    root.lang = language
  }, [theme, color, language])

  return <>{children}</>
}