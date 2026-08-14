import { type RouteObject } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthProvider'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { ChildDashboardPage } from '../pages/ChildDashboardPage'
import { ParentDashboardPage } from '../pages/ParentDashboardPage'
import { LandingPage } from '../pages/LandingPage'
import { GameHubPage } from '../pages/GameHubPage'

const hubRoute = (
  <AuthProvider>
    <ProtectedRoute>
      <GameHubPage />
    </ProtectedRoute>
  </AuthProvider>
)

const childRoute = (
  <AuthProvider>
    <ProtectedRoute>
      <ChildDashboardPage />
    </ProtectedRoute>
  </AuthProvider>
)

const parentRoute = (
  <AuthProvider>
    <ProtectedRoute>
      <ParentDashboardPage />
    </ProtectedRoute>
  </AuthProvider>
)

export const routes: RouteObject[] = [
  { path: '/', element: hubRoute },
  { path: '/login', element: <AuthProvider><LoginPage /></AuthProvider> },
  { path: '/hoc-cung-con', element: <LandingPage /> },
  { path: '/hoc-cung-con/app', element: childRoute },
  { path: '/hoc-cung-con/phu-huynh', element: parentRoute },
]
