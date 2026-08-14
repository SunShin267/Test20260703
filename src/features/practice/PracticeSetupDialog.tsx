import { useEffect, useRef, useState } from 'react'
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
  const dialogRef = useRef<HTMLElement>(null)
  const initialFocusRef = useRef<HTMLInputElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const activeElement = document.activeElement
    openerRef.current = activeElement instanceof HTMLElement ? activeElement : null
    initialFocusRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      ))
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      openerRef.current?.focus()
    }
  }, [onClose])

  return (
    <section aria-labelledby="practice-setup-title" aria-modal="true" className="dialog" ref={dialogRef} role="dialog">
      <h2 id="practice-setup-title">Luyện {topic.name}</h2>
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
        <button onClick={() => onStart(difficulty, count)} type="button">Bắt đầu làm bài</button>
      </div>
    </section>
  )
}
