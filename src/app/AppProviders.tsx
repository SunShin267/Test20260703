import { createContext, useContext, type PropsWithChildren } from 'react'
import type { AuthService } from '../features/auth/authService'
import type { PinService } from '../features/parent/pinService'
import type { ProfileService } from '../features/profiles/profileService'
import type { PracticeService } from '../features/practice/practiceService'
import type { QuestionBankService } from '../features/practice/questionBankService'
import type { AppRepository } from '../shared/storage/AppRepository'

export interface AppServices {
  repository: AppRepository
  authService?: AuthService
  profileService?: ProfileService
  pinService?: PinService
  practiceService?: PracticeService
  questionBankService?: QuestionBankService
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
