import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/AppProviders'
import { routes } from './app/router'
import { AuthService } from './features/auth/authService'
import { SessionRepository } from './features/auth/sessionRepository'
import { AppRepository } from './shared/storage/AppRepository'
import { BrowserStorageAdapter } from './shared/storage/BrowserStorageAdapter'
import './styles/tokens.css'
import './styles/global.css'

const storage = new BrowserStorageAdapter()
const repository = new AppRepository(storage)
const services = { repository, authService: new AuthService(repository, new SessionRepository(storage)) }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders services={services}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </AppProviders>
  </StrictMode>,
)
