import { useEffect, useState } from 'react'
import type { ChildProfile, PracticeSession } from '../../shared/model/types'
import { PrintableWorksheet } from './PrintableWorksheet'

interface PrintActionsProps {
  session: PracticeSession
  profile: ChildProfile
  parentVerified: boolean
}

export interface PrintWorksheetOptions {
  includeAnswers: boolean
}

export function printWorksheet(_options: PrintWorksheetOptions): void {
  window.print()
}

export function PrintActions({ session, profile, parentVerified }: PrintActionsProps) {
  const [request, setRequest] = useState<PrintWorksheetOptions | null>(null)

  useEffect(() => {
    if (!request) return
    const frame = window.requestAnimationFrame(() => printWorksheet(request))
    return () => window.cancelAnimationFrame(frame)
  }, [request])

  const requestPrint = (includeAnswers: boolean) => {
    setRequest({ includeAnswers })
  }
  const includeAnswers = parentVerified && request?.includeAnswers === true

  return (
    <>
      <section aria-label="Tùy chọn in" className="no-print print-actions">
        <button onClick={() => requestPrint(false)} type="button">{parentVerified ? 'In phiếu trắng' : 'In phiếu bài tập'}</button>
        {parentVerified && <button onClick={() => requestPrint(true)} type="button">In kèm đáp án</button>}
      </section>
      {request && <div className="print-root"><PrintableWorksheet includeAnswers={includeAnswers} profile={profile} session={session} /></div>}
    </>
  )
}
