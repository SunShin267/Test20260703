import type { MathTopic, ProgressSummary } from '../../shared/model/types'

interface ProgressSummaryCardsProps {
  summary: ProgressSummary
  streak: number
  recentScore: number | null
  recommendation: MathTopic | null
}

export function ProgressSummaryCards({ summary, streak, recentScore, recommendation }: ProgressSummaryCardsProps) {
  if (summary.totalSessions === 0) {
    return (
      <section aria-label="Tiến bộ">
        <h2>Tiến bộ</h2>
        <p>Hoàn thành bài đầu tiên để xem tiến bộ của con.</p>
      </section>
    )
  }

  return (
    <section aria-label="Tiến bộ">
      <h2>Tiến bộ</h2>
      <p><strong>🔥 {streak} ngày</strong></p>
      <p>{summary.accuracy}% chính xác</p>
      {recentScore !== null && <p>Điểm gần nhất: {recentScore}%</p>}
      {recommendation && (
        <section aria-label="Gợi ý ôn tập">
          <h2>Nên ôn tiếp</h2>
          <p><strong>{recommendation.icon} {recommendation.name}</strong></p>
          <p>Dựa trên các câu con đã làm, mình cùng luyện thêm chủ đề này nhé.</p>
        </section>
      )}
    </section>
  )
}
