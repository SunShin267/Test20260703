import type { ProgressSummary } from '../../shared/model/types'
import { TOPICS } from '../practice/topicCatalog'

export function ParentOverview({ summary }: { summary: ProgressSummary }) {
  const weeklySessions = summary.weekly.reduce((total, day) => total + day.sessions, 0)
  const weeklyQuestions = summary.weekly.reduce((total, day) => total + day.questions, 0)
  const topicName = (id: string | null) => TOPICS.find(topic => topic.id === id)?.name ?? 'Chưa có dữ liệu'

  return <section aria-labelledby="parent-overview-heading">
    <h2 id="parent-overview-heading">Tiến bộ tuần này</h2>
    {summary.totalSessions === 0 ? <p>Chưa có bài luyện hoàn thành</p> : <>
      <p>{weeklySessions} buổi và {weeklyQuestions} câu hỏi trong 7 ngày gần đây.</p>
      <p>Tổng cộng: {summary.totalSessions} buổi, {summary.totalQuestions} câu, {summary.accuracy}% chính xác.</p>
      <p>Chủ đề mạnh: {topicName(summary.strongestTopicId)}</p>
      <p>Chủ đề cần ôn: {topicName(summary.weakestTopicId)}</p>
    </>}
  </section>
}
