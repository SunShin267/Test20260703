import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppServices } from '../app/AppProviders'
import { useAuth } from '../features/auth/AuthProvider'
import { AppHeader } from './AppHeader'

interface FamilyPageLayoutProps {
  children: ReactNode
  description: ReactNode
  greetingName?: string
  mainClassName?: string
}

export function FamilyPageLayout({ children, description, greetingName, mainClassName }: FamilyPageLayoutProps) {
  const navigate = useNavigate()
  const { repository } = useAppServices()
  const { signOut } = useAuth()
  const accountName = repository.load().account?.username ?? 'gia đình'
  const displayName = greetingName?.trim() || accountName
  const mainClasses = ['family-main', mainClassName].filter(Boolean).join(' ')
  const leave = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="family-shell">
      <AppHeader accountName={accountName} onSignOut={leave} brandLabel="SunShinSon" homeLabel="SunShinSon" />
      <main className={mainClasses}>
        <section className="hub-intro" aria-labelledby="family-page-title">
          <p className="eyebrow">Không gian gia đình</p>
          <h1 id="family-page-title">SunShinSon</h1>
          <p>Chào <strong>{displayName}</strong>, {description}</p>
        </section>
        {children}
      </main>
    </div>
  )
}
