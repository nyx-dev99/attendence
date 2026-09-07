import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const Ctx = createContext<{ dark: boolean; toggle: () => void }>({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem('sat_theme') === 'dark' : false
  )

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sat_theme', dark ? 'dark' : 'light')
    }
  }, [dark])

  return <Ctx.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>{children}</Ctx.Provider>
}

export function useTheme() {
  return useContext(Ctx)
}
