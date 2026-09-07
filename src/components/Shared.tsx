import { type ReactNode, createContext, useCallback, useContext, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { logOut } from '../services/authService'
import type { Role } from '../types'

/* ---------- Navbar ---------- */
export function Navbar() {
  const { user, setUser } = useAuth()
  const { dark, toggle } = useTheme()
  const home = user?.role === 'cr' ? '/cr' : user?.role === 'teacher' ? '/teacher' : '/student'

  const roleBadgeStyle =
    user?.role === 'cr'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
      : user?.role === 'teacher'
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'

  return (
    <nav className="sticky top-0 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to={user ? home : '/'} className="font-bold text-brand-blue flex items-center gap-2">
          <span>🎓</span>
          <span>Smart Attendance Tracker</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="btn-outline text-sm" onClick={toggle} aria-label="Toggle theme">
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium">{user.name}</span>
                <span className={`badge uppercase font-semibold text-[10px] ${roleBadgeStyle}`}>
                  {user.role}
                </span>
              </div>
              <button
                className="btn-outline text-sm"
                onClick={async () => {
                  await logOut()
                  setUser(null)
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ---------- Protected route ---------- */
export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center text-slate-500">Loading session…</div>
  if (!user) return <Navigate to="/" replace />
  if (user.role !== role) {
    const home = user.role === 'cr' ? '/cr' : user.role === 'teacher' ? '/teacher' : '/student'
    return <Navigate to={home} replace />
  }
  return <>{children}</>
}

/* ---------- Toast (simple confirmation/error messages) ---------- */
interface Toast { id: number; text: string; kind: 'success' | 'error' | 'info' }
const ToastCtx = createContext<{ push: (text: string, kind?: Toast['kind']) => void }>({
  push: () => {},
})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((text: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-xl shadow text-white text-sm ${
              t.kind === 'success' ? 'bg-brand-green' : t.kind === 'error' ? 'bg-red-500' : 'bg-slate-700'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}

/* ---------- Empty state ---------- */
export function EmptyState({ text }: { text: string }) {
  return <div className="text-center text-sm text-slate-500 py-10">{text}</div>
}
