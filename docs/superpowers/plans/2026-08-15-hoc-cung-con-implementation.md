# Học cùng con Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển repo HTML tĩnh thành ứng dụng React/Vite “Học cùng con” có đăng nhập cục bộ, nhiều hồ sơ trẻ, luyện Toán lớp 1–5, báo cáo phụ huynh, in bài và kiến trúc mở rộng đến lớp 12/backend.

**Architecture:** React Router điều hướng Game Hub, landing page, ứng dụng học và khu vực phụ huynh. Các feature chỉ phụ thuộc vào repository/service interface; adapter trình duyệt quản lý dữ liệu cục bộ và có thể được thay bằng API sau này. Các game cũ tiếp tục chạy dưới `public/games` và dùng một stylesheet nhận diện chung.

**Tech Stack:** React, TypeScript, Vite, React Router, Zod, Web Crypto API, Vitest, Testing Library, jsdom, CSS thuần.

## Global Constraints

- Thương hiệu hiển thị là **Học cùng con**; không sao chép thương hiệu hoặc tài sản của `baitap.xyz`.
- Phiên bản đầu hỗ trợ lớp 1–5; `Grade` và topic registry phải cho phép đăng ký lớp 6–12 mà không sửa component.
- Không component nào được đọc hoặc ghi `localStorage`/`sessionStorage` trực tiếp.
- Đăng nhập và PIN chỉ là hàng rào cục bộ; UI phải nói rõ dữ liệu chỉ nằm trên thiết bị.
- Mật khẩu và PIN phải được băm kèm salt trước khi lưu.
- Mobile-first, dùng được bằng bàn phím, focus rõ, không dùng màu làm tín hiệu duy nhất và tôn trọng `prefers-reduced-motion`.
- Các game HTML hiện tại phải giữ nguyên logic và tiếp tục truy cập được từ Game Hub.
- Task 1 được phép tạo cấu hình Vite/Vitest trước vòng RED đầu tiên; ngoại lệ này chỉ áp dụng cho file cấu hình, không áp dụng cho code ứng dụng.
- Khi xóa hồ sơ trẻ sau bước xác nhận, phải xóa toàn bộ phiên học thuộc hồ sơ đó để không tạo dữ liệu mồ côi.
- Phạm vi bàn giao là code và bản build đã kiểm thử trong repo; không triển khai lên URL nếu không có yêu cầu riêng.
- Mỗi task phải hoàn tất test liên quan và commit riêng trước khi sang task kế tiếp.

## File Map

### Nền tảng

- `package.json`: scripts và dependencies.
- `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`: build/test TypeScript.
- `index.html`: Vite entrypoint.
- `src/main.tsx`: bootstrap React.
- `src/app/router.tsx`: route tree và guards.
- `src/app/AppProviders.tsx`: dependency injection cho repositories/services.
- `src/styles/tokens.css`, `src/styles/global.css`: design tokens và base styles.

### Dữ liệu và domain

- `src/shared/model/types.ts`: toàn bộ contract domain dùng xuyên feature.
- `src/shared/storage/StorageAdapter.ts`: storage interface.
- `src/shared/storage/BrowserStorageAdapter.ts`: browser implementation.
- `src/shared/storage/appDataSchema.ts`: Zod schema, default data và migration.
- `src/shared/storage/AppRepository.ts`: API dữ liệu duy nhất cho feature.
- `src/shared/security/hashSecret.ts`: salt/hash/verify bằng Web Crypto.

### Feature

- `src/features/auth/*`: tài khoản gia đình, phiên đăng nhập, login/register và route guard.
- `src/features/profiles/*`: CRUD hồ sơ trẻ và chọn hồ sơ hiện tại.
- `src/features/practice/*`: catalog, generators, phiên làm bài, tính điểm và UI luyện tập.
- `src/features/progress/*`: streak, tổng hợp tuần và gợi ý chủ đề.
- `src/features/parent/*`: PIN, quản lý hồ sơ, mục tiêu và báo cáo.
- `src/features/print/*`: worksheet view và print stylesheet.
- `src/pages/*`: landing, Game Hub, child dashboard và route-level pages.

### Legacy và kiểm thử

- `public/games/*.html`: các game hiện có.
- `public/legacy-theme.css`: nhận diện chung cho game HTML.
- `src/test/setup.ts`, `src/**/*.test.ts(x)`: test unit/component/integration.

---

### Task 1: React/Vite foundation và bảo toàn game cũ

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Replace: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/router.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`
- Create: `src/app/router.test.tsx`
- Move: `co-caro.html` → `public/games/co-caro.html`
- Move: `co-vua.html` → `public/games/co-vua.html`
- Move: `random-number-page.html` → `public/games/random-number-page.html`
- Move: `bai-tap-ai.html` → `public/bai-tap-ai.html`

**Interfaces:**
- Produces: route paths `/`, `/login`, `/hoc-cung-con`, `/hoc-cung-con/app`, `/hoc-cung-con/phu-huynh`.
- Produces: static game URLs `/games/co-caro.html`, `/games/co-vua.html`, `/games/random-number-page.html`.

- [ ] **Step 1: Create package/build configuration (approved setup exception)**

Create `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html` with `#root`, and `src/test/setup.ts`. Do not create application components or routes in this step.

```json
{
  "name": "hoc-cung-con",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`

Expected: lockfile created and Vitest command available.

- [ ] **Step 3: Write the failing router smoke test**

```tsx
// src/app/router.test.tsx
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from './router'

it.each([
  ['/', 'Game Hub'],
  ['/login', 'Đăng nhập'],
  ['/hoc-cung-con', 'Học cùng con'],
])('renders %s', async (path, heading) => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)
  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
})
```

- [ ] **Step 4: Run the test and confirm it fails for the missing router**

Run: `pnpm vitest run src/app/router.test.tsx`

Expected: FAIL because `src/app/router.tsx` does not exist.

- [ ] **Step 5: Create minimal route components and bootstrap**

```tsx
// src/app/router.tsx
import type { RouteObject } from 'react-router-dom'

const RouteStub = ({ title }: { title: string }) => <main><h1>{title}</h1></main>

export const routes: RouteObject[] = [
  { path: '/', element: <RouteStub title="Game Hub" /> },
  { path: '/login', element: <RouteStub title="Đăng nhập" /> },
  { path: '/hoc-cung-con', element: <RouteStub title="Học cùng con" /> },
  { path: '/hoc-cung-con/app', element: <RouteStub title="Góc học tập" /> },
  { path: '/hoc-cung-con/phu-huynh', element: <RouteStub title="Dành cho phụ huynh" /> },
]
```

`src/main.tsx` creates a browser router from `routes`, imports `tokens.css` and `global.css`, and renders into `#root`.

- [ ] **Step 6: Move legacy pages and keep an old-link redirect**

Use `git mv` for the three game files. Replace `public/bai-tap-ai.html` content with a valid HTML redirect to `/hoc-cung-con` using both `<meta http-equiv="refresh">` and an accessible link.

- [ ] **Step 7: Run smoke tests and production build**

Run: `pnpm test && pnpm build`

Expected: router tests PASS; Vite creates `dist/index.html` and copies all four public HTML files.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts tsconfig*.json index.html src public
git commit -m "build: migrate site to React and Vite"
```

---

### Task 2: Domain contracts, storage adapter và migrations

**Files:**
- Create: `src/shared/model/types.ts`
- Create: `src/shared/storage/StorageAdapter.ts`
- Create: `src/shared/storage/BrowserStorageAdapter.ts`
- Create: `src/shared/storage/MemoryStorageAdapter.ts`
- Create: `src/shared/storage/appDataSchema.ts`
- Create: `src/shared/storage/AppRepository.ts`
- Create: `src/shared/storage/appDataSchema.test.ts`
- Create: `src/shared/storage/AppRepository.test.ts`
- Create: `src/app/AppProviders.tsx`
- Create: `src/test/renderApp.tsx`
- Create: `src/test/fixtures.ts`

**Interfaces:**
- Produces: `Grade`, `SupportedGrade`, `ChildProfile`, `MathTopic`, `Question`, `PracticeSession`, `SessionResult`, `ParentSettings`, `LocalAccount`, `AppData`.
- Produces: `StorageAdapter`, `AppRepository.load()`, `AppRepository.update(mutator)` and `AppRepository.reset()`.
- Produces: `AppServices`, `<AppProviders services>`, `useAppServices()` and reusable `renderApp(path, fixture)` test helper.

- [ ] **Step 1: Define failing migration and repository tests**

```ts
it('returns valid defaults for corrupted storage', () => {
  expect(parseAndMigrate('{broken')).toEqual(createDefaultAppData())
})

it('migrates an unversioned profile into schema v1', () => {
  const data = parseAndMigrate(JSON.stringify({ profiles: [{ id: 'p1', name: 'An', grade: 3 }] }))
  expect(data.schemaVersion).toBe(1)
  expect(data.profiles[0]).toMatchObject({ id: 'p1', name: 'An', grade: 3 })
})

it('persists updates through the adapter', () => {
  const adapter = new MemoryStorageAdapter()
  const repository = new AppRepository(adapter)
  repository.update(data => ({ ...data, activeProfileId: 'p1' }))
  expect(repository.load().activeProfileId).toBe('p1')
})
```

- [ ] **Step 2: Run tests and confirm missing symbols**

Run: `pnpm vitest run src/shared/storage`

Expected: FAIL because schemas and repository do not exist.

- [ ] **Step 3: Add exact domain contracts**

```ts
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type SupportedGrade = 1 | 2 | 3 | 4 | 5
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface ChildProfile {
  id: string; name: string; grade: SupportedGrade; avatar: string
  createdAt: string; updatedAt: string; schemaVersion: 1
}
export interface Question {
  id: string; topicId: string; prompt: string; answer: string
  explanation: string; grade: Grade; difficulty: Difficulty
}
export interface PracticeSession {
  id: string; profileId: string; topicId: string; questions: Question[]
  answers: Record<string, string>; status: 'draft' | 'completed'
  startedAt: string; completedAt: string | null; createdAt: string; updatedAt: string; schemaVersion: 1
}
export interface AppData {
  schemaVersion: 1; account: LocalAccount | null; profiles: ChildProfile[]
  activeProfileId: string | null; sessions: PracticeSession[]
  parentSettings: ParentSettings; printSettings: PrintSettings
}

export interface LocalAccount {
  username: string; passwordSalt: string; passwordHash: string
  createdAt: string; updatedAt: string; schemaVersion: 1
}
export interface ParentSettings {
  pinSalt: string | null; pinHash: string | null; failedPinAttempts: number
  pinLockedUntil: number | null; weeklySessionGoal: number; weeklyQuestionGoal: number
  updatedAt: string; schemaVersion: 1
}
export interface SessionResult {
  sessionId: string; correctCount: number; totalCount: number; scorePercent: number
  answers: Array<{ questionId: string; correct: boolean; expected: string; actual: string }>
}
export interface MathTopic {
  id: string; name: string; icon: string; minGrade: Grade; maxGrade: Grade
  category: 'number' | 'arithmetic' | 'measurement' | 'geometry' | 'mixed'; generatorId: string
}
export interface ProgressSummary {
  profileId: string; totalSessions: number; totalQuestions: number; accuracy: number
  weekly: Array<{ date: string; sessions: number; questions: number; correct: number }>
  byTopic: Record<string, { attempts: number; correct: number; accuracy: number }>
  strongestTopicId: string | null; weakestTopicId: string | null
}
export interface PrintSettings {
  includeChildName: boolean; includeDate: boolean; answerKeyPlacement: 'none' | 'last-page'
  updatedAt: string; schemaVersion: 1
}
```

Do not add network, synchronization or payment fields to these contracts.

- [ ] **Step 4: Implement storage boundary and validation**

```ts
export interface StorageAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

export class AppRepository {
  constructor(private readonly storage: StorageAdapter, private readonly key = 'hoc-cung-con:v1') {}
  load(): AppData { return parseAndMigrate(this.storage.get(this.key)) }
  update(mutator: (data: AppData) => AppData): AppData {
    const next = appDataSchema.parse(mutator(this.load()))
    this.storage.set(this.key, JSON.stringify(next))
    return next
  }
  reset(): void { this.storage.remove(this.key) }
}
```

`parseAndMigrate` must catch JSON/Zod failures, return `createDefaultAppData()`, and preserve valid profile records from the legacy unversioned shape.

```tsx
export interface AppServices { repository: AppRepository }
const AppServicesContext = createContext<AppServices | null>(null)
export const AppProviders = ({ services, children }: PropsWithChildren<{ services: AppServices }>) =>
  <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>
export const useAppServices = () => {
  const value = useContext(AppServicesContext)
  if (!value) throw new Error('AppProviders is missing')
  return value
}
```

- [ ] **Step 5: Run storage tests**

Run: `pnpm vitest run src/shared/storage`

Expected: all migration, corrupted-data and persistence tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/shared
git commit -m "feat: add versioned local data repository"
```

---

### Task 3: Local authentication và protected routes

**Files:**
- Create: `src/shared/security/hashSecret.ts`
- Create: `src/shared/security/hashSecret.test.ts`
- Create: `src/features/auth/authService.ts`
- Create: `src/features/auth/sessionRepository.ts`
- Create: `src/features/auth/AuthProvider.tsx`
- Create: `src/features/auth/ProtectedRoute.tsx`
- Create: `src/features/auth/LoginPage.tsx`
- Create: `src/features/auth/authService.test.ts`
- Create: `src/features/auth/LoginPage.test.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/app/AppProviders.tsx`

**Interfaces:**
- Consumes: `AppRepository`, `LocalAccount`, `StorageAdapter`.
- Produces: `hashSecret(secret, salt)`, `verifySecret(secret, salt, hash)`, `AuthService.register`, `AuthService.signIn`, `AuthService.signOut`, `AuthService.isAuthenticated`.

- [ ] **Step 1: Write failing security and auth tests**

```ts
it('never stores the raw password', async () => {
  await service.register('gia-dinh-an', 'matkhau123')
  const account = repository.load().account!
  expect(account.passwordHash).not.toContain('matkhau123')
  expect(account.passwordSalt).not.toHaveLength(0)
})

it('rejects an incorrect password', async () => {
  await service.register('gia-dinh-an', 'matkhau123')
  expect(await service.signIn('gia-dinh-an', 'sai-mat-khau')).toBe(false)
})
```

Add a component test asserting an unauthenticated visit to `/` redirects to the “Đăng nhập” heading and successful submit navigates to Game Hub.

- [ ] **Step 2: Run auth tests and confirm failure**

Run: `pnpm vitest run src/shared/security src/features/auth`

Expected: FAIL because auth modules do not exist.

- [ ] **Step 3: Implement salted Web Crypto hashing**

```ts
export async function hashSecret(secret: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${secret}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

export function createSalt(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('')
}
```

- [ ] **Step 4: Implement auth service and session boundary**

Use `SessionRepository` with key `hoc-cung-con:session:v1`. `register` validates username length ≥ 3 and password length ≥ 8, stores only salt/hash, then starts the session. `signIn` compares username and `verifySecret`; `signOut` removes only the session key.

```ts
export class AuthService {
  constructor(private app: AppRepository, private session: SessionRepository) {}
  async register(username: string, password: string): Promise<void> {
    const normalized = username.trim().toLowerCase()
    if (normalized.length < 3 || password.length < 8) throw new Error('Thông tin đăng ký chưa hợp lệ')
    const passwordSalt = createSalt()
    const passwordHash = await hashSecret(password, passwordSalt)
    const now = new Date().toISOString()
    this.app.update(data => ({ ...data, account: { username: normalized, passwordSalt, passwordHash, createdAt: now, updatedAt: now, schemaVersion: 1 } }))
    this.session.set(normalized)
  }
  async signIn(username: string, password: string): Promise<boolean> {
    const account = this.app.load().account
    const ok = Boolean(account && account.username === username.trim().toLowerCase() && await verifySecret(password, account.passwordSalt, account.passwordHash))
    if (ok) this.session.set(account!.username)
    return ok
  }
  signOut(): void { this.session.clear() }
  isAuthenticated(): boolean { return this.session.get() === this.app.load().account?.username }
}
```

- [ ] **Step 5: Implement login/register UI and route guard**

`LoginPage` toggles “Đăng nhập” / “Tạo tài khoản gia đình”, shows the local-data notice, uses labels for every field and displays explicit errors. Wrap `/`, `/hoc-cung-con/app`, `/hoc-cung-con/phu-huynh` in `<ProtectedRoute>`; leave `/login` and `/hoc-cung-con` public.

```tsx
export function ProtectedRoute({ children }: PropsWithChildren) {
  const { authenticated } = useAuth()
  return authenticated ? children : <Navigate to="/login" replace />
}
```

- [ ] **Step 6: Run auth and router tests**

Run: `pnpm vitest run src/shared/security src/features/auth src/app/router.test.tsx`

Expected: all tests PASS, including redirect and logout behavior.

- [ ] **Step 7: Commit**

```bash
git add src/shared/security src/features/auth src/app/router.tsx src/app/router.test.tsx
git commit -m "feat: add local family authentication"
```

---

### Task 4: Multiple child profiles và parent PIN

**Files:**
- Create: `src/features/profiles/profileService.ts`
- Create: `src/features/profiles/ProfileSwitcher.tsx`
- Create: `src/features/profiles/ProfileForm.tsx`
- Create: `src/features/profiles/profileService.test.ts`
- Create: `src/features/parent/pinService.ts`
- Create: `src/features/parent/PinGate.tsx`
- Create: `src/features/parent/pinService.test.ts`
- Modify: `src/shared/model/types.ts`
- Modify: `src/shared/storage/appDataSchema.ts`
- Modify: `src/app/AppProviders.tsx`

**Interfaces:**
- Consumes: `AppRepository`, `hashSecret`, `verifySecret`.
- Produces: `ProfileService.list/create/update/remove/select/getActive`.
- Produces: `PinService.setPin/verifyPin/changePin/getLockState`.

- [ ] **Step 1: Write failing profile and PIN tests**

```ts
it('creates and selects two independent profiles', () => {
  const an = service.create({ name: 'An', grade: 1, avatar: '🌱' })
  const binh = service.create({ name: 'Bình', grade: 5, avatar: '🚀' })
  service.select(binh.id)
  expect(service.list()).toHaveLength(2)
  expect(service.getActive()?.id).toBe(binh.id)
  expect(an.grade).toBe(1)
})

it('locks PIN verification after five failures for five minutes', async () => {
  await pinService.setPin('1234')
  for (let i = 0; i < 5; i += 1) await pinService.verifyPin('0000')
  expect(pinService.getLockState(now).lockedUntil).toBe(now + 300_000)
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm vitest run src/features/profiles src/features/parent/pinService.test.ts`

Expected: FAIL because services are missing.

- [ ] **Step 3: Implement profile CRUD rules**

`create` trims names, restricts `grade` to 1–5, generates `crypto.randomUUID()`, and automatically selects the first profile. `remove` also removes every session belonging to that profile and selects the next remaining profile; it must reject removal of the last profile unless `allowEmpty` is explicitly true from the parent screen.

```ts
create(input: Pick<ChildProfile, 'name' | 'grade' | 'avatar'>): ChildProfile
update(id: string, patch: Pick<ChildProfile, 'name' | 'grade' | 'avatar'>): ChildProfile
remove(id: string, options?: { allowEmpty?: boolean }): void
select(id: string): void
getActive(): ChildProfile | null
```

- [ ] **Step 4: Implement PIN hashing and lockout**

Store `pinSalt`, `pinHash`, `failedPinAttempts`, and `pinLockedUntil` in `ParentSettings`. Only accept `/^\d{4}$/`. Successful verification resets attempts; the fifth failure sets `pinLockedUntil = now + 300_000`.

```ts
async setPin(pin: string): Promise<void>
async verifyPin(pin: string, now = Date.now()): Promise<{ ok: boolean; lockedUntil: number | null }>
async changePin(currentPin: string, nextPin: string): Promise<boolean>
getLockState(now = Date.now()): { locked: boolean; lockedUntil: number | null }
```

- [ ] **Step 5: Implement accessible profile UI and PIN gate**

`ProfileSwitcher` renders buttons with `aria-pressed`; `ProfileForm` provides name, grade 1–5 and avatar choices. `PinGate` uses a four-digit numeric input, announces remaining lock time and never renders protected children until verification succeeds.

```tsx
<button aria-pressed={profile.id === activeId} onClick={() => onSelect(profile.id)}>{profile.avatar} {profile.name}</button>
<input aria-label="Mã PIN phụ huynh" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} />
```

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run src/features/profiles src/features/parent`

Expected: CRUD, selection, hashing and lockout tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/profiles src/features/parent src/shared/model/types.ts src/shared/storage/appDataSchema.ts
git commit -m "feat: add child profiles and parent PIN"
```

---

### Task 5: Topic catalog lớp 1–5, question generators và scoring

**Files:**
- Create: `src/features/practice/topicCatalog.ts`
- Create: `src/features/practice/generators/types.ts`
- Create: `src/features/practice/generators/arithmetic.ts`
- Create: `src/features/practice/generators/appliedMath.ts`
- Create: `src/features/practice/generators/registry.ts`
- Create: `src/features/practice/practiceService.ts`
- Create: `src/features/practice/scoring.ts`
- Create: `src/features/practice/topicCatalog.test.ts`
- Create: `src/features/practice/generators.test.ts`
- Create: `src/features/practice/scoring.test.ts`
- Modify: `src/app/AppProviders.tsx`

**Interfaces:**
- Produces: `TOPICS`, `topicsForGrade(grade)` and `registerGenerator(topicId, generator)`.
- Produces: `QuestionGenerator.generate(input): Question`.
- Produces: `PracticeService.createSession/answer/complete/resumeDraft`.
- Produces: `scoreSession(session): SessionResult`.

- [ ] **Step 1: Write failing catalog, generator and scoring tests**

```ts
it('offers at least 15 topics and supports every grade 1–5', () => {
  expect(TOPICS.length).toBeGreaterThanOrEqual(15)
  for (const grade of [1, 2, 3, 4, 5] as const) expect(topicsForGrade(grade).length).toBeGreaterThan(0)
})

it('can register a future grade-12 generator without changing UI code', () => {
  registerGenerator('quadratic-equation', fakeGenerator)
  expect(generatorFor('quadratic-equation')).toBe(fakeGenerator)
})

it('scores normalized numeric answers', () => {
  expect(scoreAnswer(' 12 ', '12')).toBe(true)
  expect(scoreAnswer('12', '13')).toBe(false)
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm vitest run src/features/practice`

Expected: FAIL because catalog, registry and scoring do not exist.

- [ ] **Step 3: Create a metadata-driven catalog**

Define at least these topic IDs: `number-sense`, `counting`, `add`, `subtract`, `compare`, `missing-number`, `patterns`, `multiply`, `divide`, `word-add-subtract`, `word-multiply-divide`, `fractions`, `length`, `mass`, `time`, `geometry`, `perimeter-area`, `mixed`. Each `MathTopic` contains `id`, Vietnamese `name`, `icon`, `minGrade`, `maxGrade`, `category` and `generatorId`.

- [ ] **Step 4: Implement deterministic generator inputs and registry**

```ts
export interface GeneratorInput {
  grade: Grade; difficulty: Difficulty; random: () => number
}
export interface QuestionGenerator {
  generate(input: GeneratorInput): Question
}
const registry = new Map<string, QuestionGenerator>()
export const registerGenerator = (id: string, generator: QuestionGenerator) => registry.set(id, generator)
export const generatorFor = (id: string) => {
  const generator = registry.get(id)
  if (!generator) throw new Error(`Không có bộ tạo câu hỏi: ${id}`)
  return generator
}
```

Use the injected `random` function in tests. Arithmetic ranges must be grade-aware: grade 1 within 20/100, grade 2 within 1,000, grade 3 within 10,000, grade 4 within 100,000, grade 5 within 1,000,000, adjusted downward for `easy` and upward for `hard` without creating negative subtraction results or non-integer division answers.

- [ ] **Step 5: Implement session lifecycle and scoring**

`createSession(profileId, topicId, difficulty, count)` validates count ∈ {5,10,15}, generates unique questions and persists a draft. `answer` updates one answer and `updatedAt`. `complete` calculates `correctCount`, `scorePercent`, per-question results and sets `completedAt`; calling it twice must not create duplicate history.

```ts
createSession(profileId: string, topicId: string, difficulty: Difficulty, count: 5 | 10 | 15): PracticeSession
answer(sessionId: string, questionId: string, value: string): PracticeSession
complete(sessionId: string): SessionResult
resumeDraft(profileId: string): PracticeSession | null
```

- [ ] **Step 6: Run practice tests**

Run: `pnpm vitest run src/features/practice`

Expected: catalog, grade bounds, integer division, registry extension and scoring tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/practice src/shared/model/types.ts
git commit -m "feat: add extensible math topic engine"
```

---

### Task 6: Child dashboard, practice flow và autosave

**Files:**
- Create: `src/pages/ChildDashboardPage.tsx`
- Create: `src/features/practice/TopicGrid.tsx`
- Create: `src/features/practice/PracticeSetupDialog.tsx`
- Create: `src/features/practice/PracticePage.tsx`
- Create: `src/features/practice/QuestionCard.tsx`
- Create: `src/features/practice/ResultPanel.tsx`
- Create: `src/features/practice/PracticePage.test.tsx`
- Create: `src/features/practice/practice-flow.test.tsx`
- Create: `src/pages/ChildDashboardPage.test.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `ProfileService`, `PracticeService`, `topicsForGrade`, `scoreSession`.
- Produces: complete child flow under `/hoc-cung-con/app`; route query `?session=<id>` resumes a draft.

- [ ] **Step 1: Write failing practice flow test**

```tsx
it('creates, autosaves and completes a five-question session', async () => {
  renderApp('/hoc-cung-con/app', seededAuthenticatedFamily())
  await user.click(screen.getByRole('button', { name: 'Phép cộng' }))
  await user.click(screen.getByRole('button', { name: '5 câu' }))
  await user.click(screen.getByRole('button', { name: 'Bắt đầu làm bài' }))
  await user.type(screen.getByLabelText('Đáp án câu 1'), '10')
  expect(repository.load().sessions[0].answers).toHaveProperty(expect.any(String), '10')
  await fillRemainingAnswers(user)
  await user.click(screen.getByRole('button', { name: 'Nộp bài' }))
  expect(await screen.findByText(/câu đúng/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the flow test and confirm failure**

Run: `pnpm vitest run src/features/practice/practice-flow.test.tsx`

Expected: FAIL because dashboard and practice UI do not exist.

- [ ] **Step 3: Build dashboard and topic selection**

Render `ProfileSwitcher`, active child greeting, the weekly goal progress from `parentSettings.weeklySessionGoal`, and `TopicGrid` filtered by active grade. If no profiles exist, show `ProfileForm` onboarding instead of an empty dashboard.

```tsx
return activeProfile ? (
  <><ProfileSwitcher profiles={profiles} activeId={activeProfile.id} onSelect={selectProfile} />
  <section aria-label="Mục tiêu tuần"><strong>{settings.weeklySessionGoal} buổi</strong></section>
  <TopicGrid topics={topicsForGrade(activeProfile.grade)} onSelect={openSetup} /></>
) : <ProfileForm mode="create" onSubmit={createProfile} />
```

- [ ] **Step 4: Build setup and practice UI**

`PracticeSetupDialog` provides three difficulty radio buttons and question-count buttons 5/10/15. `PracticePage` supports “Từng câu” and “Phiếu bài tập”, labels every answer input, shows text plus icon for correct/incorrect and persists every input change through `PracticeService.answer`.

```tsx
<fieldset><legend>Độ khó</legend>{(['easy','medium','hard'] as const).map(level =>
  <label key={level}><input type="radio" name="difficulty" value={level} />{difficultyLabel[level]}</label>
)}</fieldset>
<input aria-label={`Đáp án câu ${index + 1}`} value={answer} onChange={event => saveAnswer(question.id, event.target.value)} />
```

- [ ] **Step 5: Build result and resume behavior**

On reload, find `resumeDraft(activeProfileId)` and offer “Tiếp tục bài đang làm”. `ResultPanel` shows score percent, correct count, per-question explanation and a button returning to the dashboard.

```tsx
{draft && <Link to={`/hoc-cung-con/app?session=${draft.id}`}>Tiếp tục bài đang làm</Link>}
<p>{result.correctCount}/{result.totalCount} câu đúng · {result.scorePercent}%</p>
```

- [ ] **Step 6: Run component and integration tests**

Run: `pnpm vitest run src/features/practice src/pages/ChildDashboardPage.test.tsx`

Expected: setup, autosave, resume, submit-once and result tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/ChildDashboardPage.tsx src/features/practice src/app/router.tsx src/styles/global.css
git commit -m "feat: add child practice experience"
```

---

### Task 7: Progress, streaks và personalized recommendations

**Files:**
- Create: `src/features/progress/progressService.ts`
- Create: `src/features/progress/streakService.ts`
- Create: `src/features/progress/ProgressSummaryCards.tsx`
- Create: `src/features/progress/WeeklyActivity.tsx`
- Create: `src/features/progress/progressService.test.ts`
- Create: `src/features/progress/streakService.test.ts`
- Modify: `src/pages/ChildDashboardPage.tsx`
- Modify: `src/shared/model/types.ts`

**Interfaces:**
- Consumes: completed `PracticeSession[]`, `MathTopic[]`, profile ID and current date.
- Produces: `summarizeProgress(profileId, sessions)`, `calculateStreak(dates, today)`, `recommendTopic(summary, topics)`.

- [ ] **Step 1: Write failing progress tests**

```ts
it('calculates a three-day streak ending today', () => {
  expect(calculateStreak(['2026-08-13', '2026-08-14', '2026-08-15'], '2026-08-15')).toBe(3)
})

it('recommends the attempted topic with the lowest accuracy', () => {
  const summary = summarizeProgress('p1', sessionsFor({ add: [true, true], subtract: [false, false] }))
  expect(recommendTopic(summary, TOPICS)?.id).toBe('subtract')
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm vitest run src/features/progress`

Expected: FAIL because progress services do not exist.

- [ ] **Step 3: Implement pure aggregation functions**

`summarizeProgress` returns total sessions, total questions, accuracy, seven daily buckets, per-topic attempts/accuracy, strongest and weakest attempted topics. Ignore drafts and sessions from other profiles. `calculateStreak` de-duplicates dates and counts consecutive local calendar dates backward from today.

```ts
export function summarizeProgress(profileId: string, sessions: PracticeSession[]): ProgressSummary
export function calculateStreak(completedDates: string[], today: string): number
export function recommendTopic(summary: ProgressSummary, topics: MathTopic[]): MathTopic | null
```

- [ ] **Step 4: Add progress cards and recommendation to child dashboard**

Show streak, weekly completion against target, recent score and a “Nên ôn tiếp” topic card. Empty histories show a welcoming first-session message, never fake percentages.

```tsx
if (summary.totalSessions === 0) return <p>Hoàn thành bài đầu tiên để xem tiến bộ của con.</p>
return <section aria-label="Tiến bộ"><strong>🔥 {streak} ngày</strong><span>{summary.accuracy}% chính xác</span></section>
```

- [ ] **Step 5: Run tests**

Run: `pnpm vitest run src/features/progress src/pages`

Expected: aggregation, date boundaries, empty history and recommendation tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress src/pages/ChildDashboardPage.tsx src/shared/model/types.ts
git commit -m "feat: add progress and streak insights"
```

---

### Task 8: Parent dashboard, profile management và weekly goals

**Files:**
- Create: `src/pages/ParentDashboardPage.tsx`
- Create: `src/features/parent/ParentOverview.tsx`
- Create: `src/features/parent/ProfileManagement.tsx`
- Create: `src/features/parent/WeeklyGoalForm.tsx`
- Create: `src/features/parent/HistoryTable.tsx`
- Create: `src/features/parent/ParentDashboardPage.test.tsx`
- Modify: `src/app/router.tsx`

**Interfaces:**
- Consumes: `PinService`, `ProfileService`, `summarizeProgress`, `AppRepository`.
- Produces: protected parent route with profile CRUD, goals, history and reset confirmation.

- [ ] **Step 1: Write failing parent flow test**

```tsx
it('requires PIN before showing reports and updates a weekly goal', async () => {
  renderApp('/hoc-cung-con/phu-huynh', seededFamilyWithPin('1234'))
  expect(screen.queryByText('Tiến bộ tuần này')).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('Mã PIN phụ huynh'), '1234')
  await user.click(screen.getByRole('button', { name: 'Mở khóa' }))
  expect(await screen.findByText('Tiến bộ tuần này')).toBeInTheDocument()
  await user.clear(screen.getByLabelText('Mục tiêu số buổi mỗi tuần'))
  await user.type(screen.getByLabelText('Mục tiêu số buổi mỗi tuần'), '5')
  await user.click(screen.getByRole('button', { name: 'Lưu mục tiêu' }))
  expect(repository.load().parentSettings.weeklySessionGoal).toBe(5)
})
```

- [ ] **Step 2: Run test and confirm failure**

Run: `pnpm vitest run src/features/parent/ParentDashboardPage.test.tsx`

Expected: FAIL because parent dashboard does not exist.

- [ ] **Step 3: Implement PIN-gated reports**

After `PinGate`, render profile selector, weekly totals, strongest/weakest topics, seven-day activity and paginated recent history. A profile with no sessions shows “Chưa có bài luyện hoàn thành”.

```tsx
<PinGate service={pinService}>
  <ParentOverview summary={summary} />
  <WeeklyActivity days={summary.weekly} />
  <HistoryTable sessions={completedSessions} pageSize={10} />
</PinGate>
```

- [ ] **Step 4: Implement management actions**

Reuse `ProfileForm` for create/edit. Weekly goals accept sessions 1–14 and questions 5–200. Profile deletion requires a dialog naming the child. “Đặt lại toàn bộ dữ liệu” requires typing `XÓA DỮ LIỆU`, then calls `AppRepository.reset()` and signs out.

```ts
const goalSchema = z.object({ sessions: z.number().int().min(1).max(14), questions: z.number().int().min(5).max(200) })
const canReset = confirmation === 'XÓA DỮ LIỆU'
const resetAll = () => { if (!canReset) return; repository.reset(); auth.signOut(); navigate('/login') }
```

- [ ] **Step 5: Run parent tests**

Run: `pnpm vitest run src/features/parent src/features/profiles`

Expected: PIN gate, reports, goal validation, profile confirmation and reset tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/ParentDashboardPage.tsx src/features/parent src/app/router.tsx
git commit -m "feat: add parent progress dashboard"
```

---

### Task 9: Landing page, Game Hub và shared visual system

**Files:**
- Create: `src/pages/LandingPage.tsx`
- Create: `src/pages/GameHubPage.tsx`
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/PhonePreview.tsx`
- Create: `src/pages/LandingPage.test.tsx`
- Create: `src/pages/GameHubPage.test.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: auth state and stable route/static-game URLs.
- Produces: finished `/hoc-cung-con` landing and authenticated `/` hub.

- [ ] **Step 1: Write failing content and link tests**

```tsx
it('renders the complete three-step landing experience', () => {
  renderRoute('/hoc-cung-con')
  expect(screen.getByRole('heading', { name: /5 phút mỗi ngày/ })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Chỉ 3 bước là xong' })).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: /Bắt đầu|Dùng thử/ }).length).toBeGreaterThan(0)
})

it('links every Game Hub card to a valid route', () => {
  renderAuthenticatedRoute('/')
  expect(screen.getByRole('link', { name: 'Mở Học cùng con' })).toHaveAttribute('href', '/hoc-cung-con/app')
  expect(screen.getByRole('link', { name: 'Mở Cờ Caro' })).toHaveAttribute('href', '/games/co-caro.html')
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm vitest run src/pages/LandingPage.test.tsx src/pages/GameHubPage.test.tsx`

Expected: FAIL because finished pages do not exist.

- [ ] **Step 3: Implement landing sections**

Build header, hero, `PhonePreview`, numeric proof strip, three-step section, six benefit cards, parent quote, final CTA and footer. Use copy from the approved spec, brand “Học cùng con”, and no external images or copied assets.

```tsx
<main>
  <Hero title="5 phút mỗi ngày, con vững Toán cả năm" ctaHref="/hoc-cung-con/app" />
  <ProofStrip items={['18+ chủ đề Toán', 'Lớp 1–5', 'Luyện mọi lúc']} />
  <ThreeSteps items={['Chọn chủ đề', 'Con làm bài', 'Phụ huynh theo dõi']} />
  <Benefits items={benefits.slice(0, 6)} />
  <ParentQuote />
  <FinalCta href="/hoc-cung-con/app" />
</main>
```

- [ ] **Step 4: Implement authenticated Game Hub**

Render cards for Random Number, Cờ Caro, Cờ Vua and Học cùng con. Add local-account label, “Đăng xuất” action and concise device-only data notice. Update the math card copy to lớp 1–5.

```ts
const hubItems = [
  { title: 'Random Number', href: '/games/random-number-page.html' },
  { title: 'Cờ Caro', href: '/games/co-caro.html' },
  { title: 'Cờ Vua', href: '/games/co-vua.html' },
  { title: 'Học cùng con', href: '/hoc-cung-con/app' },
]
```

- [ ] **Step 5: Implement design tokens and responsive states**

Define tokens for navy background, cream surfaces, coral primary, sky blue secondary, green success, focus ring, spacing and radii. Add breakpoints at 840px and 560px; add `@media (prefers-reduced-motion: reduce)` that disables smooth scrolling and transitions.

```css
:root { --navy:#17243d; --cream:#fffaf0; --coral:#ff725e; --sky:#4e87e8; --success:#1f9d72; --focus:#ffd166; --radius:18px; }
:focus-visible { outline:3px solid var(--focus); outline-offset:3px; }
@media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior:auto!important; transition:none!important; animation:none!important; } }
```

- [ ] **Step 6: Run page tests and build**

Run: `pnpm vitest run src/pages && pnpm build`

Expected: content/link tests PASS and production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages src/components src/styles src/app/router.tsx
git commit -m "feat: add branded landing page and Game Hub"
```

---

### Task 10: Printable worksheets và protected answer keys

**Files:**
- Create: `src/features/print/PrintableWorksheet.tsx`
- Create: `src/features/print/PrintActions.tsx`
- Create: `src/features/print/print.css`
- Create: `src/features/print/PrintableWorksheet.test.tsx`
- Modify: `src/features/practice/ResultPanel.tsx`
- Modify: `src/pages/ParentDashboardPage.tsx`

**Interfaces:**
- Consumes: `PracticeSession`, `ChildProfile`, verified-parent state.
- Produces: `PrintableWorksheet({ session, profile, includeAnswers })`; `printWorksheet(options)` calling `window.print()`.

- [ ] **Step 1: Write failing print tests**

```tsx
it('renders child, grade and questions without answers by default', () => {
  render(<PrintableWorksheet session={session} profile={profile} includeAnswers={false} />)
  expect(screen.getByText('An · Lớp 3')).toBeInTheDocument()
  expect(screen.getByText(session.questions[0].prompt)).toBeInTheDocument()
  expect(screen.queryByText(session.questions[0].answer)).not.toBeInTheDocument()
})

it('shows the answer key only when parent verification is true', () => {
  render(<PrintActions session={session} parentVerified={false} />)
  expect(screen.queryByRole('button', { name: 'In kèm đáp án' })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm vitest run src/features/print`

Expected: FAIL because print components do not exist.

- [ ] **Step 3: Implement printable semantic markup**

Render title, child name, grade, topic, generated date, numbered questions and blank answer lines. When `includeAnswers` is true, append `<section className="answer-key">` with number/answer/explanation.

```tsx
<article className="print-sheet">
  <header><h1>Học cùng con</h1><p>{profile.name} · Lớp {profile.grade}</p></header>
  <ol>{session.questions.map(question => <li key={question.id}><p>{question.prompt}</p><span className="answer-line" /></li>)}</ol>
  {includeAnswers && <section className="answer-key"><h2>Đáp án</h2>{session.questions.map((q, i) => <p key={q.id}>{i + 1}. {q.answer} — {q.explanation}</p>)}</section>}
</article>
```

- [ ] **Step 4: Implement print controls and CSS**

Child/result screens expose “In phiếu bài tập”; the parent screen exposes “In phiếu trắng” and, only after PIN verification, “In kèm đáp án”. `print.css` uses `@page { size: A4; margin: 16mm; }`, hides `.no-print`, avoids question page breaks and forces the answer key onto a new page.

```css
@page { size:A4; margin:16mm; }
@media print { .no-print { display:none!important; } .print-sheet li { break-inside:avoid; } .answer-key { break-before:page; } }
```

- [ ] **Step 5: Run print tests**

Run: `pnpm vitest run src/features/print`

Expected: answer visibility, metadata and `window.print` tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/print src/features/practice/ResultPanel.tsx src/pages/ParentDashboardPage.tsx
git commit -m "feat: add printable math worksheets"
```

---

### Task 11: Legacy theme synchronization và end-to-end regression

**Files:**
- Create: `public/legacy-theme.css`
- Modify: `public/games/co-caro.html`
- Modify: `public/games/co-vua.html`
- Modify: `public/games/random-number-page.html`
- Create: `src/test/legacy-pages.test.ts`
- Create: `src/test/app-flow.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: Game Hub design tokens translated to static CSS variables.
- Produces: consistent legacy header/home link and full app regression coverage.

- [ ] **Step 1: Write failing static-page regression test**

```ts
it.each(['co-caro.html', 'co-vua.html', 'random-number-page.html'])('%s loads the shared theme', file => {
  const html = readFileSync(`public/games/${file}`, 'utf8')
  expect(html).toContain('/legacy-theme.css')
  expect(html).toContain('href="/"')
  expect(html).toContain('Về Game Hub')
})
```

Add an integration test covering register → create two profiles → switch profile → complete a session → unlock parent view → see history → logout.

- [ ] **Step 2: Run regression tests and confirm failure**

Run: `pnpm vitest run src/test/legacy-pages.test.ts src/test/app-flow.test.tsx`

Expected: FAIL because legacy theme links and final flow are incomplete.

- [ ] **Step 3: Add the shared legacy theme**

`public/legacy-theme.css` defines the same navy/cream/coral/blue tokens, `.legacy-app-header`, `.legacy-home-link`, focus styles and responsive spacing. Add a compact header and `<a href="/">Về Game Hub</a>` to each game without changing existing IDs, board markup or scripts.

- [ ] **Step 4: Complete accessibility and responsive regression fixes**

Run Testing Library accessibility-oriented queries to ensure all inputs have labels and dialogs have names. Confirm correct/incorrect states include text/icon. Add CSS only where tests reveal overflow at 360px; do not alter game mechanics.

- [ ] **Step 5: Run the full verification suite**

Run: `pnpm test`

Expected: every unit, component, integration, print and legacy test PASS.

Run: `pnpm build`

Expected: TypeScript and Vite build PASS; `dist/games` contains all three games and `dist/bai-tap-ai.html` contains the compatibility redirect.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 6: Manually verify the critical flows**

Start `pnpm dev`; verify desktop and 360px mobile layouts for `/login`, `/`, `/hoc-cung-con`, `/hoc-cung-con/app`, `/hoc-cung-con/phu-huynh`. Complete one session, reload a draft, check PIN lockout messaging, open print preview and open all three legacy games from Game Hub.

- [ ] **Step 7: Commit**

```bash
git add public src/test src/styles/global.css
git commit -m "test: complete app and legacy regression coverage"
```

---

## Execution Checkpoints

- **Checkpoint A — after Task 4:** React foundation, storage, login, profiles and PIN are independently usable.
- **Checkpoint B — after Task 8:** Complete child learning and parent reporting flow works with local data.
- **Checkpoint C — after Task 11:** Landing, Game Hub, printing, legacy visual sync, accessibility and full regression suite are complete.

At each checkpoint run `pnpm test`, `pnpm build`, and inspect `git status --short` before continuing.
