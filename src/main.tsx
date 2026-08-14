import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/AppProviders'
import { routes } from './app/router'
import { AuthService } from './features/auth/authService'
import { SessionRepository } from './features/auth/sessionRepository'
import { PracticeService } from './features/practice/practiceService'
import { LocalQuestionBankService } from './features/practice/questionBankService'
import { ProfileService } from './features/profiles/profileService'
import { AppRepository } from './shared/storage/AppRepository'
import { BrowserStorageAdapter } from './shared/storage/BrowserStorageAdapter'
import './styles/tokens.css'
import './styles/global.css'

const storage = new BrowserStorageAdapter()
const repository = new AppRepository(storage)
const questionBankService = new LocalQuestionBankService(repository)
const services = {
  repository,
  authService: new AuthService(repository, new SessionRepository(storage)),
  profileService: new ProfileService(repository),
  practiceService: new PracticeService(repository, { questionBank: questionBankService }),
  questionBankService,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders services={services}>
      <RouterProvider router={createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })} />
    </AppProviders>
  </StrictMode>,
)
