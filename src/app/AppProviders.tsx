import { createContext, useContext, type PropsWithChildren } from 'react'
import type { AuthService } from '../features/auth/authService'
import type { AppRepository } from '../shared/storage/AppRepository'

export interface AppServices {
  repository: AppRepository
  authService?: AuthService
}

const AppServicesContext = createContext<AppServices | null>(null)

export const AppProviders = ({ services, children }: PropsWithChildren<{ services: AppServices }>) => (
  <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>
)

export const useAppServices = (): AppServices => {
  const value = useContext(AppServicesContext)
  if (!value) throw new Error('AppProviders is missing')
  return value
}
