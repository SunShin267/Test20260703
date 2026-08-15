import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useAppServices } from '../app/AppProviders'
import { useAuth } from '../features/auth/AuthProvider'
import { sitePath } from '../shared/routing/sitePath'

const hubItems = [
  { title: 'SunShinSon', icon: '✦', href: '/hoc-cung-con/app', description: 'Luyện Toán lớp 1–5 theo nhịp riêng của con.', accent: 'coral', actionLabel: 'Bắt đầu học với SunShinSon', featured: true },
  { title: 'Random Number', icon: '⌘', href: '/games/random-number-page.html', description: 'Một trò chọn số ngẫu nhiên, nhanh và vui.', accent: 'sky', actionLabel: 'Chơi Random Number', featured: false },
  { title: 'Cờ Caro', icon: '⊞', href: '/games/co-caro.html', description: 'Cùng nhau đấu trí với bàn cờ caro quen thuộc.', accent: 'green', actionLabel: 'Chơi Cờ Caro', featured: false },
  { title: 'Cờ Vua', icon: '♞', href: '/games/co-vua.html', description: 'Khởi động một ván cờ và rèn tư duy chiến thuật.', accent: 'gold', actionLabel: 'Chơi Cờ Vua', featured: false },
]

export function GameHubPage() {
  const navigate = useNavigate()
  const { repository } = useAppServices()
  const { signOut } = useAuth()
  const accountName = repository.load().account?.username ?? 'gia đình'
  const leave = () => { signOut(); navigate('/login', { replace: true }) }

  return (
    <div className="hub-shell">
      <AppHeader accountName={accountName} onSignOut={leave} brandLabel="SunShinSon" homeLabel="SunShinSon" />
      <main className="hub-main">
        <section className="hub-intro" aria-labelledby="hub-title">
          <p className="eyebrow">Không gian gia đình</p>
          <h1 id="hub-title">SunShinSon</h1>
          <p>Chào <strong>{accountName}</strong>, chọn một hoạt động để bắt đầu khoảng thời gian vui vẻ cùng nhau.</p>
        </section>
        <section aria-labelledby="activities-title">
          <div className="hub-section-title"><h2 id="activities-title">Hoạt động hôm nay</h2><p>Chọn bất kỳ hoạt động nào, không cần thiết lập thêm.</p></div>
          <ul className="hub-grid">
            {hubItems.map(item => (
              <li key={item.title} className={item.featured ? 'hub-grid__featured' : undefined}>
                <a
                  href={sitePath(item.href)}
                  className={`hub-card hub-card--${item.accent}${item.featured ? ' hub-card--featured' : ''}`}
                  aria-label={item.actionLabel}
                >
                  <span className="hub-card__icon" aria-hidden="true">{item.icon}</span>
                  {item.featured && <span className="hub-card__badge">Gợi ý hôm nay</span>}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="hub-card__action" aria-hidden="true">
                    {item.featured ? 'Bắt đầu học' : 'Chọn hoạt động'} <span>→</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <aside className="local-notice" aria-label="Thông tin dữ liệu cục bộ"><span aria-hidden="true">⌂</span><div><strong>Tài khoản cục bộ: {accountName}</strong><p>Dữ liệu và phiên đăng nhập chỉ được lưu trên thiết bị này.</p></div></aside>
      </main>
    </div>
  )
}
