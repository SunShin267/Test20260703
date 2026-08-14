import type { PracticeSession, SessionResult } from '../../shared/model/types'

interface ResultPanelProps {
  session: PracticeSession
  result: SessionResult
  onBack: () => void
}

export function ResultPanel({ session, result, onBack }: ResultPanelProps) {
  const excellent = result.scorePercent >= 80
  const badge = excellent ? 'Sao chăm chỉ' : 'Người không bỏ cuộc'
  const encouragement = excellent ? 'Con làm rất tốt, hãy giữ nhịp học này nhé!' : 'Con đã cố gắng hết mình, cùng xem lại lời giải và thử tiếp nhé!'

  return (
    <section aria-labelledby="result-title" className="result-panel">
      <h2 id="result-title">Kết quả bài làm</h2>
      <p>{result.correctCount}/{result.totalCount} câu đúng · {result.scorePercent}%</p>
      <p><strong>🏅 Huy hiệu: {badge}</strong></p>
      <p>{encouragement}</p>
      <ol>
        {session.questions.map((question, index) => {
          const answer = result.answers[index]
          return <li key={question.id}>
            <strong><span aria-hidden="true">{answer.correct ? '✅' : '❌'}</span> {answer.correct ? 'Đúng' : 'Chưa đúng'}</strong>
            <p>Giải thích: {question.explanation}</p>
          </li>
        })}
      </ol>
      <button onClick={onBack} type="button">Về góc học tập</button>
    </section>
  )
}

