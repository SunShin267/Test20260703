import { useState } from 'react'
import type { Difficulty, MathTopic } from '../../shared/model/types'

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

  return (
    <section aria-labelledby="practice-setup-title" aria-modal="true" className="dialog" role="dialog">
      <h2 id="practice-setup-title">Luyện {topic.name}</h2>
      <fieldset>
        <legend>Độ khó</legend>
        {(['easy', 'medium', 'hard'] as const).map(level => (
          <label key={level}>
            <input checked={difficulty === level} name="difficulty" onChange={() => setDifficulty(level)} type="radio" value={level} />
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
        <button onClick={() => onStart(difficulty, count)} type="button">Bắt đầu làm bài</button>
      </div>
    </section>
  )
}

