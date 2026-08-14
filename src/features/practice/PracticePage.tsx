import { useState } from 'react'
import { useAppServices } from '../../app/AppProviders'
import type { PracticeSession, SessionResult } from '../../shared/model/types'
import { QuestionCard } from './QuestionCard'
import { ResultPanel } from './ResultPanel'

interface PracticePageProps {
  sessionId: string
  onBack: () => void
}

export function PracticePage({ sessionId, onBack }: PracticePageProps) {
  const { repository, practiceService } = useAppServices()
  if (!practiceService) throw new Error('AppProviders is missing practiceService')
  const [session, setSession] = useState<PracticeSession | null>(() => findSession(repository, sessionId))
  const [mode, setMode] = useState<'single' | 'worksheet'>('single')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [result, setResult] = useState<SessionResult | null>(() => session?.status === 'completed' ? practiceService.complete(session.id) : null)

  if (!session) return <main><h1>Không tìm thấy bài đang làm</h1><button onClick={onBack} type="button">Về góc học tập</button></main>
  const profile = repository.load().profiles.find(candidate => candidate.id === session.profileId)
  if (result) return <main><ResultPanel onBack={onBack} profile={profile} result={result} session={session} /></main>

  const saveAnswer = (questionId: string, value: string) => setSession(practiceService.answer(sessionId, questionId, value))
  const questions = mode === 'worksheet' ? session.questions : [session.questions[currentIndex]]

  return (
    <main>
      <header className="practice-header">
        <h1>Bài luyện tập</h1>
        <div aria-label="Chế độ làm bài" role="group">
          <button aria-pressed={mode === 'single'} onClick={() => setMode('single')} type="button">Từng câu</button>
          <button aria-pressed={mode === 'worksheet'} onClick={() => setMode('worksheet')} type="button">Phiếu bài tập</button>
        </div>
      </header>
      {mode === 'single' && <p>Câu {currentIndex + 1} trên {session.questions.length}</p>}
      {questions.map(question => {
        const index = session.questions.findIndex(candidate => candidate.id === question.id)
        return <QuestionCard key={question.id} index={index} onAnswer={value => saveAnswer(question.id, value)} question={question} value={session.answers[question.id] ?? ''} />
      })}
      {mode === 'single' && <div className="button-row">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(index => index - 1)} type="button">Câu trước</button>
        <button disabled={currentIndex === session.questions.length - 1} onClick={() => setCurrentIndex(index => index + 1)} type="button">Câu tiếp</button>
      </div>}
      <button onClick={() => setResult(practiceService.complete(sessionId))} type="button">Nộp bài</button>
    </main>
  )
}

function findSession(repository: ReturnType<typeof useAppServices>['repository'], sessionId: string): PracticeSession | null {
  return repository.load().sessions.find(session => session.id === sessionId) ?? null
}
