import { useEffect, useId, useRef, type PropsWithChildren, type RefObject } from 'react'

interface AccessibleDialogProps extends PropsWithChildren {
  title: string
  onClose: () => void
  initialFocusRef?: RefObject<HTMLElement | null>
  ariaLabel?: string
  className?: string
}

const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'

export function AccessibleDialog({ title, onClose, initialFocusRef, ariaLabel, className = 'dialog', children }: AccessibleDialogProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  onCloseRef.current = onClose

  useEffect(() => {
    const activeElement = document.activeElement
    openerRef.current = activeElement instanceof HTMLElement ? activeElement : null
    const dialog = dialogRef.current
    const firstFocusable = dialog?.querySelector<HTMLElement>(focusableSelector)
    ;(initialFocusRef?.current ?? firstFocusable)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
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
  }, [initialFocusRef])

  return <section aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : titleId} aria-modal="true" className={className} ref={dialogRef} role="dialog">
    <h2 id={titleId}>{title}</h2>
    {children}
  </section>
}
