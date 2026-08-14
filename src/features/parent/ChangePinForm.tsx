import { useRef, useState, type FormEvent } from 'react'
import type { PinService } from './pinService'

export function ChangePinForm({ pinService }: { pinService: PinService }) {
  const [currentPin, setCurrentPin] = useState('')
  const [nextPin, setNextPin] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const feedbackRef = useRef<HTMLParagraphElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (nextPin !== confirmation) {
      setError('Mã PIN xác nhận chưa khớp')
      requestAnimationFrame(() => feedbackRef.current?.focus())
      return
    }

    try {
      if (!await pinService.changePin(currentPin, nextPin)) {
        setError('Mã PIN hiện tại không đúng')
        requestAnimationFrame(() => feedbackRef.current?.focus())
        return
      }
      setCurrentPin('')
      setNextPin('')
      setConfirmation('')
      setMessage('Đã đổi mã PIN phụ huynh')
      requestAnimationFrame(() => feedbackRef.current?.focus())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể đổi mã PIN phụ huynh')
      requestAnimationFrame(() => feedbackRef.current?.focus())
    }
  }

  return <section aria-labelledby="change-pin-heading">
    <h2 id="change-pin-heading">Đổi mã PIN</h2>
    <form onSubmit={submit}>
      <label>Mã PIN hiện tại<input aria-label="Mã PIN hiện tại" inputMode="numeric" maxLength={4} onChange={event => setCurrentPin(event.target.value)} pattern="[0-9]{4}" type="password" value={currentPin} /></label>
      <label>Mã PIN mới<input aria-label="Mã PIN mới" inputMode="numeric" maxLength={4} onChange={event => setNextPin(event.target.value)} pattern="[0-9]{4}" type="password" value={nextPin} /></label>
      <label>Xác nhận mã PIN mới<input aria-label="Xác nhận mã PIN mới" inputMode="numeric" maxLength={4} onChange={event => setConfirmation(event.target.value)} pattern="[0-9]{4}" type="password" value={confirmation} /></label>
      {error && <p ref={feedbackRef} role="alert" tabIndex={-1}>{error}</p>}
      {message && <p ref={feedbackRef} role="status" tabIndex={-1}>{message}</p>}
      <button type="submit">Đổi mã PIN</button>
    </form>
  </section>
}
