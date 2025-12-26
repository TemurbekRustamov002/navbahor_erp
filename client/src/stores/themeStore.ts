import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type Color = 'green' | 'blue' | 'purple' | 'orange' | 'red'

interface ThemeState {
  theme: Theme
  color: Color
  setTheme: (theme: Theme) => void
  setColor: (color: Color) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      color: 'green',
      
      setTheme: (theme: Theme) => {
        set({ theme })
        updateDocumentTheme(theme)
      },
      
      setColor: (color: Color) => {
        set({ color })
        updateDocumentColor(color)
      },
      
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
    }),
    {
      name: 'navbahor-theme-storage',
    }
  )
)

function updateDocumentTheme(theme: Theme) {
  if (typeof window === 'undefined') return

  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
}

function updateDocumentColor(color: Color) {
  if (typeof window === 'undefined') return

  const root = window.document.documentElement
  
  // Remove existing color classes
  root.classList.remove('theme-green', 'theme-blue', 'theme-purple', 'theme-orange', 'theme-red')
  
  // Add new color class
  root.classList.add(`theme-${color}`)
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme } = useThemeStore.getState()
    if (theme === 'system') {
      updateDocumentTheme('system')
    }
  })
}