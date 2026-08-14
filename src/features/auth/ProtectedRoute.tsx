import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { authenticated } = useAuth()
  return authenticated ? children : <Navigate to="/login" replace />
}
