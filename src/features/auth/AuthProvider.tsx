import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { useAppServices } from '../../app/AppProviders'
import { AuthService } from './authService'
import { SessionRepository } from './sessionRepository'

interface AuthContextValue {
  authenticated: boolean
  register: (username: string, password: string) => Promise<void>
  signIn: (username: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const { repository, storage } = useAppServices()
  const service = useMemo(() => new AuthService(repository, new SessionRepository(storage)), [repository, storage])
  const [authenticated, setAuthenticated] = useState(() => service.isAuthenticated())

  const register = useCallback(async (username: string, password: string) => {
    await service.register(username, password)
    setAuthenticated(true)
  }, [service])

  const signIn = useCallback(async (username: string, password: string) => {
    const ok = await service.signIn(username, password)
    setAuthenticated(ok)
    return ok
  }, [service])

  const signOut = useCallback(() => {
    service.signOut()
    setAuthenticated(false)
  }, [service])

  const value = useMemo(() => ({ authenticated, register, signIn, signOut }), [authenticated, register, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider is missing')
  return value
}
