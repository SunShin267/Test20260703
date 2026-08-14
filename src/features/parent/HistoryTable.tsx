import { useMemo, useState } from 'react'
import type { PracticeSession } from '../../shared/model/types'
import { scoreSession } from '../practice/scoring'
import { TOPICS } from '../practice/topicCatalog'

export function HistoryTable({ sessions, pageSize = 10 }: { sessions: PracticeSession[]; pageSize?: number }) {
  const [page, setPage] = useState(0)
  const sorted = useMemo(() => [...sessions].sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt)), [sessions])
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pages - 1)
  const rows = sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  return <section aria-labelledby="history-heading">
    <h2 id="history-heading">Lịch sử bài luyện</h2>
    {sorted.length === 0 ? <p>Chưa có bài luyện hoàn thành</p> : <>
      <div className="history-scroll">
        <table>
          <thead><tr><th scope="col">Ngày hoàn thành</th><th scope="col">Chủ đề</th><th scope="col">Kết quả</th></tr></thead>
          <tbody>{rows.map(session => {
            const score = scoreSession(session)
            return <tr key={session.id}><td>{session.completedAt ?? session.updatedAt}</td><td>{TOPICS.find(topic => topic.id === session.topicId)?.name ?? session.topicId}</td><td>{score.correctCount}/{score.totalCount} ({score.scorePercent}%)</td></tr>
          })}</tbody>
        </table>
      </div>
      {pages > 1 && <nav aria-label="Phân trang lịch sử">
        <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} type="button">Trang trước</button>
        <span>Trang {currentPage + 1} / {pages}</span>
        <button disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)} type="button">Trang sau</button>
      </nav>}
    </>}
  </section>
}
