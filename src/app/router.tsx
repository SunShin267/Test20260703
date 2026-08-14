import { useNavigate, type RouteObject } from 'react-router-dom'
import { AuthProvider, useAuth } from '../features/auth/AuthProvider'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'

const RouteStub = ({ title }: { title: string }) => (
  <main>
    <h1>{title}</h1>
  </main>
)

const ProtectedPage = ({ title }: { title: string }) => {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return (
    <main>
      <h1>{title}</h1>
      <button type="button" onClick={() => { signOut(); navigate('/login', { replace: true }) }}>Đăng xuất</button>
    </main>
  )
}

const protectedRoute = (title: string) => (
  <AuthProvider>
    <ProtectedRoute>
      <ProtectedPage title={title} />
    </ProtectedRoute>
  </AuthProvider>
)

export const routes: RouteObject[] = [
  { path: '/', element: protectedRoute('Game Hub') },
  { path: '/login', element: <AuthProvider><LoginPage /></AuthProvider> },
  { path: '/hoc-cung-con', element: <RouteStub title="Học cùng con" /> },
  { path: '/hoc-cung-con/app', element: protectedRoute('Góc học tập') },
  { path: '/hoc-cung-con/phu-huynh', element: protectedRoute('Dành cho phụ huynh') },
]
