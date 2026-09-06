import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { watchAuthState } from '../services/authService'
import { getById } from '../services/store'
import type { UserProfile } from '../types'

interface AuthCtx {
  user: UserProfile | null
  loading: boolean
  setUser: (u: UserProfile | null) => void
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, setUser: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = watchAuthState(async (uid) => {
      if (uid) {
        const profile = await getById<UserProfile>('users', uid)
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return <Ctx.Provider value={{ user, loading, setUser }}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
