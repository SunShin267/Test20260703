import { Link } from 'react-router-dom'

interface AppHeaderProps {
  accountName?: string
  onSignOut?: () => void
  brandLabel?: string
  homeLabel?: string
}

export function AppHeader({
  accountName,
  onSignOut,
  brandLabel = 'Học cùng con',
  homeLabel = 'Game Hub',
}: AppHeaderProps) {
  const signedIn = Boolean(accountName)

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="brand" to="/hoc-cung-con" aria-label={`${brandLabel}, về trang giới thiệu`}>
          <span aria-hidden="true">✦</span>
          {brandLabel}
        </Link>
        <nav
          aria-label={`Điều hướng ${brandLabel}`}
          className={`app-header__nav app-header__nav--${signedIn ? 'authenticated' : 'public'}`}
        >
          {signedIn ? (
            <>
              <Link to="/">{homeLabel}</Link>
              <Link to="/hoc-cung-con/app">Góc học tập</Link>
              <Link to="/hoc-cung-con/phu-huynh">Khu vực phụ huynh</Link>
              <button className="header-sign-out" type="button" onClick={onSignOut}>Đăng xuất</button>
            </>
          ) : (
            <>
              <a href="#cach-hoat-dong">Cách hoạt động</a>
              <Link to="/login">Đăng nhập</Link>
              <Link className="button button--small" to="/hoc-cung-con/app">Dùng thử</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
