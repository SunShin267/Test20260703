import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { PhonePreview } from '../components/PhonePreview'
import { TOPICS } from '../features/practice/topicCatalog'

const steps = [
  ['01', 'Chọn chủ đề', 'Chọn phần Toán phù hợp với lớp và điều con đang muốn ôn.'],
  ['02', 'Con làm bài', 'Câu hỏi ngắn, phản hồi rõ ràng để con tự tin đi tiếp.'],
  ['03', 'Phụ huynh theo dõi', 'Xem lịch sử học và cùng con đặt một mục tiêu tuần vừa sức.'],
]

const benefits = [
  ['◌', 'Bắt đầu đúng sức', 'Nội dung theo lớp 1–5, có thể chọn độ khó trước khi làm.'],
  ['✓', 'Phản hồi ngay', 'Biết đáp án và xem giải thích ngắn sau mỗi bài.'],
  ['⌁', 'Học thành thói quen', 'Một phiên ngắn giúp gia đình dễ duy trì đều đặn.'],
  ['⌂', 'Nhiều bé, một thiết bị', 'Mỗi bé có hồ sơ và tiến độ riêng trên thiết bị gia đình.'],
  ['▥', 'Cha mẹ nắm tiến độ', 'Theo dõi bài đã làm, chủ đề mạnh/yếu và mục tiêu tuần.'],
  ['◈', 'Riêng tư tại nhà', 'Dữ liệu của gia đình được lưu cục bộ trên thiết bị đang dùng.'],
]

const topicCountLabel = TOPICS.length >= 18 ? `${TOPICS.length}+ chủ đề Toán` : `${TOPICS.length} chủ đề Toán`

export function LandingPage() {
  return (
    <div className="landing-shell">
      <AppHeader />
      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="hero-copy">
            <p className="eyebrow">Toán tiểu học, theo nhịp của con</p>
            <h1 id="landing-title">5 phút mỗi ngày, con vững Toán cả năm</h1>
            <p className="hero-lede">Một góc luyện tập nhỏ để con chủ động làm bài, còn cha mẹ dễ dàng đồng hành từ lớp 1 đến lớp 5.</p>
            <div className="hero-actions">
              <Link className="button" to="/hoc-cung-con/app">Dùng thử miễn phí</Link>
              <a className="text-link" href="#cach-hoat-dong">Xem cách hoạt động <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero-note">Không cần cài đặt. Dữ liệu chỉ ở trên thiết bị của gia đình.</p>
          </div>
          <div className="hero-art">
            <span className="shape shape--sun" aria-hidden="true" />
            <span className="shape shape--dot" aria-hidden="true" />
            <span className="shape shape--arc" aria-hidden="true" />
            <PhonePreview />
          </div>
        </section>

        <section className="proof-strip" aria-label="Phạm vi Học cùng con">
          <div><strong>{topicCountLabel}</strong><span>Từ số học đến hình học cơ bản</span></div>
          <div><strong>Lớp 1–5</strong><span>Nội dung theo đúng nhịp tiểu học</span></div>
          <div><strong>Luyện mọi lúc</strong><span>Một thiết bị, nhiều hồ sơ bé</span></div>
        </section>

        <section className="section section--steps" id="cach-hoat-dong" aria-labelledby="steps-title">
          <p className="eyebrow">Dễ bắt đầu, dễ duy trì</p>
          <h2 id="steps-title">Chỉ 3 bước là xong</h2>
          <ol className="step-grid">
            {steps.map(([number, title, body]) => (
              <li key={number} className="step-card">
                <span className="step-number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section benefits-section" aria-labelledby="benefits-title">
          <div className="section-heading">
            <div><p className="eyebrow">Dành cho cả hai</p><h2 id="benefits-title">Mỗi buổi học nhẹ nhàng hơn</h2></div>
            <p>Học cùng con không thay cha mẹ dạy Toán; nó tạo một nhịp nhỏ để cả nhà cùng nhìn thấy sự tiến bộ.</p>
          </div>
          <ul className="benefit-grid">
            {benefits.map(([icon, title, body]) => (
              <li key={title} className="benefit-card"><span className="benefit-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{body}</p></li>
            ))}
          </ul>
        </section>

        <section className="parent-quote" aria-labelledby="quote-title">
          <div className="quote-mark" aria-hidden="true">“</div>
          <div><p id="quote-title">Tôi không còn phải nghĩ mỗi tối nên cho con ôn gì. Con tự chọn bài, còn tôi chỉ cần hỏi: hôm nay con thấy phần nào vui nhất?</p><div className="quote-attribution"><strong>Một phụ huynh đang đồng hành cùng con</strong><span>Chia sẻ minh họa cho trải nghiệm sản phẩm</span></div></div>
        </section>

        <section className="final-cta" aria-labelledby="cta-title">
          <p className="eyebrow">Bắt đầu từ hôm nay</p>
          <h2 id="cta-title">Cho con một khoảng nhỏ để tự tin với Toán</h2>
          <p>Chọn một chủ đề, làm vài câu và cùng nhìn lại tiến bộ của con.</p>
          <Link className="button button--light" to="/hoc-cung-con/app">Bắt đầu cùng con</Link>
        </section>
      </main>
      <footer className="landing-footer">
        <span className="brand"><span aria-hidden="true">✦</span> Học cùng con</span>
        <span>Góc học Toán tại nhà cho lớp 1–5.</span>
        <Link to="/login">Đăng nhập gia đình</Link>
      </footer>
    </div>
  )
}
