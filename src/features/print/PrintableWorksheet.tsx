import type { ChildProfile, PracticeSession } from '../../shared/model/types'
import { TOPICS } from '../practice/topicCatalog'
import './print.css'

interface PrintableWorksheetProps {
  session: PracticeSession
  profile: ChildProfile
  includeAnswers: boolean
}

export function PrintableWorksheet({ session, profile, includeAnswers }: PrintableWorksheetProps) {
  const topic = TOPICS.find(candidate => candidate.id === session.topicId)?.name ?? 'Bài luyện tập'
  const createdAt = new Date(session.createdAt)
  const generatedDate = Number.isNaN(createdAt.getTime())
    ? session.createdAt
    : new Intl.DateTimeFormat('vi-VN').format(createdAt)

  return (
    <article className="print-sheet">
      <header>
        <h1>Học cùng con</h1>
        <p>{profile.name} · Lớp {profile.grade}</p>
        <p>Chủ đề: {topic}</p>
        <p>Ngày tạo: <time dateTime={session.createdAt}>{generatedDate}</time></p>
      </header>
      <ol>
        {session.questions.map(question => (
          <li key={question.id}>
            <p>{question.prompt}</p>
            <span aria-label="Dòng trả lời" className="answer-line" />
          </li>
        ))}
      </ol>
      {includeAnswers && (
        <section aria-labelledby="answer-key-title" className="answer-key">
          <h2 id="answer-key-title">Đáp án</h2>
          {session.questions.map((question, index) => <p key={question.id}>{index + 1}. {question.answer} — {question.explanation}</p>)}
        </section>
      )}
    </article>
  )
}
