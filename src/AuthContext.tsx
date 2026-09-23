import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import * as storage from './storage'

interface AuthContextValue {
  username: string | null
  login: (username: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => storage.getCurrentUser())

  const value = useMemo<AuthContextValue>(
    () => ({
      username,
      login: (u: string) => {
        storage.setCurrentUser(u)
        setUsername(u)
      },
      logout: () => {
        storage.logout()
        setUsername(null)
      },
    }),
    [username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
