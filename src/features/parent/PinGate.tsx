import { useEffect, useState, type FormEvent, type PropsWithChildren } from 'react'
import type { PinService } from './pinService'

interface PinGateProps extends PropsWithChildren {
  pinService: PinService
  submitLabel?: string
}

export function PinGate({ pinService, submitLabel = 'Xác nhận', children }: PinGateProps) {
  const [setupRequired, setSetupRequired] = useState(() => !pinService.isPinSet())
  const initialLock = pinService.getLockState()
  const [verified, setVerified] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState(initialLock.locked ? lockMessage(initialLock.lockedUntil!) : '')
  const [lockedUntil, setLockedUntil] = useState<number | null>(initialLock.lockedUntil)

  useEffect(() => {
    if (lockedUntil === null) return
    const delay = lockedUntil - Date.now()
    if (delay <= 0) {
      setLockedUntil(null)
      setMessage('Bạn có thể thử lại mã PIN.')
      return
    }

    const timer = window.setTimeout(() => {
      setLockedUntil(null)
      setMessage('Bạn có thể thử lại mã PIN.')
    }, delay)
    return () => window.clearTimeout(timer)
  }, [lockedUntil])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const result = await pinService.verifyPin(pin)
      setLockedUntil(result.lockedUntil)
      if (result.ok) {
        setVerified(true)
        setMessage('')
      } else {
        setMessage(result.lockedUntil ? lockMessage(result.lockedUntil) : 'Mã PIN chưa đúng')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Mã PIN chưa hợp lệ')
    }
  }

  const setupPin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pin !== confirmation) {
      setMessage('Mã PIN xác nhận chưa khớp')
      return
    }
    try {
      await pinService.setPin(pin)
      setSetupRequired(false)
      setVerified(true)
      setMessage('')
    } catch (error) {
      if (pinService.isPinSet()) {
        setSetupRequired(false)
        setPin('')
        setConfirmation('')
        setMessage('Mã PIN đã được thiết lập ở nơi khác. Vui lòng nhập mã PIN để mở khóa.')
      } else {
        setMessage(error instanceof Error ? error.message : 'Không thể tạo mã PIN phụ huynh')
      }
    }
  }

  if (verified) return <>{children}</>

  if (setupRequired) return (
    <section aria-labelledby="pin-setup-heading">
      <h2 id="pin-setup-heading">Tạo mã PIN phụ huynh</h2>
      <p>Mã PIN gồm 4 chữ số và chỉ bảo vệ khu vực phụ huynh trên thiết bị này.</p>
      <form onSubmit={setupPin}>
        <label>
          Mã PIN mới
          <input aria-label="Mã PIN mới" autoFocus inputMode="numeric" maxLength={4} onChange={event => setPin(event.target.value)} pattern="[0-9]{4}" type="password" value={pin} />
        </label>
        <label>
          Xác nhận mã PIN mới
          <input aria-label="Xác nhận mã PIN mới" inputMode="numeric" maxLength={4} onChange={event => setConfirmation(event.target.value)} pattern="[0-9]{4}" type="password" value={confirmation} />
        </label>
        <button type="submit">Tạo mã PIN</button>
        {message && <p role="alert">{message}</p>}
      </form>
    </section>
  )

  return (
    <form onSubmit={submit}>
      <label>
        Mã PIN phụ huynh
        <input
          aria-label="Mã PIN phụ huynh"
          inputMode="numeric"
          maxLength={4}
          onChange={event => setPin(event.target.value)}
          pattern="[0-9]{4}"
          type="password"
          value={pin}
        />
      </label>
      <button disabled={lockedUntil !== null} type="submit">{submitLabel}</button>
      <p aria-live="polite" role="status">{message}</p>
    </form>
  )
}

function lockMessage(lockedUntil: number): string {
  const remainingMinutes = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60_000))
  return `Mã PIN đang bị khóa. Vui lòng thử lại sau ${remainingMinutes} phút.`
}
