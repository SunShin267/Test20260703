import type { Question } from '../../shared/model/types'

interface QuestionCardProps {
  question: Question
  index: number
  value: string
  onAnswer: (value: string) => void
  feedback?: { correct: boolean }
}

export function QuestionCard({ question, index, value, onAnswer, feedback }: QuestionCardProps) {
  return (
    <article className="question-card">
      <h3>Câu {index + 1}</h3>
      <p>{question.prompt}</p>
      <label>
        Đáp án câu {index + 1}
        <input aria-label={`Đáp án câu ${index + 1}`} onChange={event => onAnswer(event.target.value)} value={value} />
      </label>
      {feedback && <p className={feedback.correct ? 'answer-correct' : 'answer-incorrect'}>
        <span aria-hidden="true">{feedback.correct ? '✅' : '❌'}</span> {feedback.correct ? 'Đúng' : 'Chưa đúng'}
      </p>}
    </article>
  )
}

