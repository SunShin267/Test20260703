# Task 8 report: parent progress dashboard

## Delivered

- Added the authenticated `/hoc-cung-con/phu-huynh` route with a parent PIN gate.
- Added truthful selected-child progress, seven-day activity, paginated completed-session history, and weekly session/question goal validation.
- Added create, edit, select, and confirmation-based deletion of child profiles through `ProfileService`; that service removes the deleted child's sessions.
- Added exact-phrase reset confirmation (`XÓA DỮ LIỆU`), repository reset, sign-out, and navigation to login.
- Added local-only custom question bank management with grade/topic/difficulty filters, Vietnamese service validation messages, create/edit/delete confirmation, and an explicit note that built-in generator templates cannot be edited.
- Added responsive table/filter styles and accessible labels, dialogs, table headers, and navigation landmarks.

## Test-first evidence

- `ParentDashboardPage.test.tsx` was introduced before the parent route existed and initially failed because the PIN input was absent.
- `QuestionBankManagement.test.tsx` was introduced before the component existed and initially failed to resolve the module.
- The reset confirmation test was mutation-checked by temporarily removing the disabled confirmation control; it failed at the expected disabled assertion, then passed after restoration.

## Verification

- `pnpm vitest run src/pages/ParentDashboardPage.test.tsx src/features/parent/QuestionBankManagement.test.tsx src/features/parent/PinGate.test.tsx` — 5 tests passed.
- `pnpm test` — 25 test files and 98 tests passed.
- `pnpm build` — TypeScript and Vite production build passed.
- `git diff --check` — no whitespace errors.
