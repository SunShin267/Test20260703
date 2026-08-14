import { useRef, useState } from 'react'
import type { Difficulty, MathTopic } from '../../shared/model/types'
import { AccessibleDialog } from '../../shared/ui/AccessibleDialog'

type SessionCount = 5 | 10 | 15

interface PracticeSetupDialogProps {
  topic: MathTopic
  onClose: () => void
  onStart: (difficulty: Difficulty, count: SessionCount) => void
}

const difficultyLabel: Record<Difficulty, string> = { easy: 'Dễ', medium: 'Vừa', hard: 'Khó' }

export function PracticeSetupDialog({ topic, onClose, onStart }: PracticeSetupDialogProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [count, setCount] = useState<SessionCount>(5)
  const [error, setError] = useState('')
  const initialFocusRef = useRef<HTMLInputElement>(null)
  return (
    <AccessibleDialog initialFocusRef={initialFocusRef} onClose={onClose} title={`Luyện ${topic.name}`}>
      <fieldset>
        <legend>Độ khó</legend>
        {(['easy', 'medium', 'hard'] as const).map(level => (
          <label key={level}>
            <input checked={difficulty === level} name="difficulty" onChange={() => setDifficulty(level)} ref={level === 'easy' ? initialFocusRef : undefined} type="radio" value={level} />
            {difficultyLabel[level]}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Số câu</legend>
        {([5, 10, 15] as const).map(value => (
          <button aria-pressed={count === value} key={value} onClick={() => setCount(value)} type="button">{value} câu</button>
        ))}
      </fieldset>
      <div className="button-row">
        <button onClick={onClose} type="button">Hủy</button>
        <button onClick={() => {
          setError('')
          try { onStart(difficulty, count) }
          catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tạo bài luyện lúc này') }
        }} type="button">Bắt đầu làm bài</button>
      </div>
      {error && <p role="alert">{error}</p>}
    </AccessibleDialog>
  )
}
