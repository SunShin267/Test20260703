# SunShinSon Home Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Home/Game Hub presentation with a minimal cream-and-soft-green SunShinSon dashboard whose entire activity cards are selectable links.

**Architecture:** Keep routing, authentication, storage, and static game destinations unchanged. Extend the shared header with optional Home-only labels, render the existing data-driven activity list as full-card anchors, and isolate all visual changes in the Home CSS selectors and responsive breakpoints.

**Tech Stack:** React 19, TypeScript, React Router, Vitest, Testing Library, Vite, CSS.

## Global Constraints

- Home replaces the visible labels “Học cùng con” and “Game Hub” with “SunShinSon”.
- The learning area remains the primary activity and continues to route to `/hoc-cung-con/app`.
- All four activity cards are whole-card links; no nested interactive controls and no separate “Mở” link.
- Keep the cream background, use soft green as the primary accent, and retain coral only as a small brand accent.
- Preserve auth, storage, routing, static game URLs, keyboard access, focus visibility, and `prefers-reduced-motion` behavior.
- Desktop, tablet, and mobile layouts must not introduce horizontal overflow.

---

### Task 1: SunShinSon copy and whole-card navigation

**Files:**
- Modify: `src/components/AppHeader.tsx`
- Modify: `src/components/AppHeader.test.tsx`
- Modify: `src/pages/GameHubPage.tsx`
- Modify: `src/pages/GameHubPage.test.tsx`
- Modify: `src/features/auth/LoginPage.test.tsx`
- Modify: `src/test/app-flow.test.tsx`

**Interfaces:**
- Consumes: existing `sitePath(path: string): string`, `AppHeader`, authenticated Home route `/`.
- Produces: `AppHeaderProps.brandLabel?: string`, `AppHeaderProps.homeLabel?: string`; four accessible full-card links with unchanged destinations.

- [ ] **Step 1: Write failing tests for the Home-only header labels**

Add this case to `src/components/AppHeader.test.tsx`:

```tsx
it('supports Home-specific branding without changing the shared defaults', () => {
  render(
    <MemoryRouter>
      <AppHeader accountName="Phụ huynh" brandLabel="SunShinSon" homeLabel="SunShinSon" />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'SunShinSon, về trang giới thiệu' })).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Điều hướng SunShinSon' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'SunShinSon' })).toHaveAttribute('href', '/')
})
```

- [ ] **Step 2: Write failing tests for SunShinSon and whole-card destinations**

Replace the first `GameHubPage` test with:

```tsx
it('uses SunShinSon branding and makes every activity card the destination link', async () => {
  await renderAuthenticatedHub()

  expect(await screen.findByRole('heading', { name: 'SunShinSon' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Game Hub' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Bắt đầu học với SunShinSon' })).toHaveAttribute('href', '/hoc-cung-con/app')
  expect(screen.getByRole('link', { name: 'Chơi Random Number' })).toHaveAttribute('href', '/games/random-number-page.html')
  expect(screen.getByRole('link', { name: 'Chơi Cờ Caro' })).toHaveAttribute('href', '/games/co-caro.html')
  expect(screen.getByRole('link', { name: 'Chơi Cờ Vua' })).toHaveAttribute('href', '/games/co-vua.html')
  expect(screen.queryByText('Mở')).not.toBeInTheDocument()
})
```

Update the Home heading expectations in `src/features/auth/LoginPage.test.tsx` and `src/test/app-flow.test.tsx` from `Game Hub` to `SunShinSon`.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npm test -- src/components/AppHeader.test.tsx src/pages/GameHubPage.test.tsx src/features/auth/LoginPage.test.tsx src/test/app-flow.test.tsx
```

Expected: FAIL because `AppHeader` does not accept the new label props, the Home heading is still “Game Hub”, and cards still contain separate “Mở” links.

- [ ] **Step 4: Add optional Home labels to `AppHeader`**

Implement the props and replace only the displayed/accessible labels:

```tsx
interface AppHeaderProps {
  accountName?: string
  onSignOut?: () => void
  brandLabel?: string
  homeLabel?: string
}

export function AppHeader({
  accountName,
  onSignOut,
  brandLabel = 'Học cùng con',
  homeLabel = 'Game Hub',
}: AppHeaderProps) {
  const signedIn = Boolean(accountName)

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="brand" to="/hoc-cung-con" aria-label={`${brandLabel}, về trang giới thiệu`}>
          <span aria-hidden="true">✦</span>
          {brandLabel}
        </Link>
        <nav
          aria-label={`Điều hướng ${brandLabel}`}
          className={`app-header__nav app-header__nav--${signedIn ? 'authenticated' : 'public'}`}
        >
          {signedIn ? (
            <>
              <Link to="/">{homeLabel}</Link>
              <Link to="/hoc-cung-con/app">Góc học tập</Link>
              <Link to="/hoc-cung-con/phu-huynh">Khu vực phụ huynh</Link>
              <button className="header-sign-out" type="button" onClick={onSignOut}>Đăng xuất</button>
            </>
          ) : (
            <>
              <a href="#cach-hoat-dong">Cách hoạt động</a>
              <Link to="/login">Đăng nhập</Link>
              <Link className="button button--small" to="/hoc-cung-con/app">Dùng thử</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Render each Home card as one link**

Extend each `hubItems` record with `actionLabel` and `featured`, set the first title to `SunShinSon`, pass `brandLabel="SunShinSon" homeLabel="SunShinSon"` to `AppHeader`, set the page heading to `SunShinSon`, and use this card structure:

```tsx
<ul className="hub-grid">
  {hubItems.map(item => (
    <li key={item.title} className={item.featured ? 'hub-grid__featured' : undefined}>
      <a
        href={sitePath(item.href)}
        className={`hub-card hub-card--${item.accent}${item.featured ? ' hub-card--featured' : ''}`}
        aria-label={item.actionLabel}
      >
        <span className="hub-card__icon" aria-hidden="true">{item.icon}</span>
        {item.featured && <span className="hub-card__badge">Gợi ý hôm nay</span>}
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <span className="hub-card__action" aria-hidden="true">
          {item.featured ? 'Bắt đầu học' : 'Chọn hoạt động'} <span>→</span>
        </span>
      </a>
    </li>
  ))}
</ul>
```

Use the exact accessible labels `Bắt đầu học với SunShinSon`, `Chơi Random Number`, `Chơi Cờ Caro`, and `Chơi Cờ Vua`.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run the command from Step 3.

Expected: 4 test files pass with no failures.

- [ ] **Step 7: Commit the behavior change**

```bash
git add src/components/AppHeader.tsx src/components/AppHeader.test.tsx src/pages/GameHubPage.tsx src/pages/GameHubPage.test.tsx src/features/auth/LoginPage.test.tsx src/test/app-flow.test.tsx
git commit -m "feat: make SunShinSon cards fully selectable"
```

---

### Task 2: Minimal cream-and-green responsive dashboard

**Files:**
- Modify: `src/pages/GameHubPage.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `.hub-grid`, `.hub-grid__featured`, `.hub-card`, `.hub-card--featured`, `.hub-card__action`, and `.local-notice` emitted by Task 1.
- Produces: one-column mobile layout, featured-full-width tablet layout, and a four-column desktop layout with the featured card spanning two columns and two rows.

- [ ] **Step 1: Write the failing responsive layout contract test**

Import `readFileSync` from `node:fs` in `src/pages/GameHubPage.test.tsx` and add:

```tsx
it('defines the mobile, tablet and desktop dashboard layout contracts', () => {
  const css = readFileSync('src/styles/global.css', 'utf8')

  expect(css).toMatch(/\.hub-grid\s*\{[^}]*grid-template-columns:\s*1fr;/)
  expect(css).toMatch(/@media \(min-width: 560px\)[\s\S]*?\.hub-grid__featured\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;/)
  expect(css).toMatch(/@media \(min-width: 840px\)[\s\S]*?\.hub-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);/)
  expect(css).toMatch(/@media \(min-width: 840px\)[\s\S]*?\.hub-grid__featured\s*\{[^}]*grid-column:\s*span 2;[^}]*grid-row:\s*span 2;/)
})
```

- [ ] **Step 2: Run the layout test and verify RED**

Run:

```bash
npm test -- src/pages/GameHubPage.test.tsx
```

Expected: FAIL because the current grid has no mobile single-column declaration or featured-card responsive contract.

- [ ] **Step 3: Replace the Home-only CSS block**

Implement the following selectors in `src/styles/global.css`, removing the old fixed-height card and separate `.hub-card__link` rules:

```css
.hub-shell { background: linear-gradient(145deg, var(--cream) 0%, #f1f6e9 100%); }
.hub-main { padding: 2.25rem 1.25rem 3rem; }
.hub-intro { padding-bottom: 1.75rem; }
.hub-intro h1 { color: var(--navy); font-size: clamp(2.4rem, 8vw, 4rem); letter-spacing: -.055em; line-height: 1; margin: 0; }
.hub-intro p:last-child { color: #526079; line-height: 1.58; margin: .9rem 0 0; max-width: 34rem; }
.hub-section-title { margin-top: 2rem; }
.hub-section-title h2 { color: var(--navy); font-size: 1.25rem; margin: 0; }
.hub-section-title p { color: var(--muted); font-size: .9rem; margin: .4rem 0 0; }
.hub-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
.hub-card { background: rgb(255 255 252 / 92%); border: 1px solid rgb(85 112 72 / 20%); border-radius: var(--radius); box-shadow: 0 10px 30px rgb(39 64 33 / 7%); display: flex; flex-direction: column; height: 100%; min-height: 12.5rem; padding: 1.3rem; text-decoration: none; transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.hub-card:hover { border-color: #78976b; box-shadow: 0 16px 34px rgb(39 64 33 / 12%); transform: translateY(-3px); }
.hub-card:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.hub-card__icon { align-items: center; background: #78976b; border-radius: .8rem; color: #fff; display: flex; font-size: 1.45rem; height: 2.8rem; justify-content: center; margin-bottom: 1.25rem; width: 2.8rem; }
.hub-card__badge { color: #56704c; font-size: .72rem; font-weight: 850; letter-spacing: .08em; margin-bottom: .55rem; text-transform: uppercase; }
.hub-card--featured { background: #e7f0dc; border-color: #b8cda9; min-height: 15rem; }
.hub-card--featured .hub-card__icon { background: #5f7f53; }
.hub-card__action { align-items: center; color: #415a38; display: flex; font-size: .84rem; font-weight: 850; gap: .4rem; margin-top: auto; padding-top: 1.15rem; }
.hub-card__action span { transition: transform .18s ease; }
.hub-card:hover .hub-card__action span { transform: translateX(3px); }
.local-notice { align-items: center; background: transparent; border: 0; border-top: 1px solid rgb(85 112 72 / 18%); border-radius: 0; margin-top: 2rem; padding: 1rem 0 0; }
.local-notice > span { color: #66825b; font-size: 1.1rem; }
```

At `min-width: 560px`, add:

```css
.hub-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.hub-grid__featured { grid-column: 1 / -1; }
```

At `min-width: 840px`, add:

```css
.hub-main { padding-bottom: 4rem; padding-top: 3.5rem; }
.hub-grid { grid-auto-rows: minmax(10rem, auto); grid-template-columns: repeat(4, minmax(0, 1fr)); }
.hub-grid__featured { grid-column: span 2; grid-row: span 2; }
.hub-card--featured { padding: 1.75rem; }
```

Keep the existing global `prefers-reduced-motion` rule unchanged.

- [ ] **Step 4: Run the layout test and verify GREEN**

Run:

```bash
npm test -- src/pages/GameHubPage.test.tsx
```

Expected: the Home component and responsive layout contract tests pass.

- [ ] **Step 5: Run the entire automated suite**

Run:

```bash
npm test
```

Expected: all test files pass with zero failures and no unexpected warnings.

- [ ] **Step 6: Commit the presentation change**

```bash
git add src/pages/GameHubPage.test.tsx src/styles/global.css
git commit -m "style: redesign the SunShinSon home dashboard"
```

---

### Task 3: Production and responsive verification

**Files:**
- Verify: `src/pages/GameHubPage.tsx`
- Verify: `src/styles/global.css`
- Verify: `dist/index.html`
- Verify: `dist/404.html`

**Interfaces:**
- Consumes: completed Home dashboard from Tasks 1–2.
- Produces: evidence that the app builds for normal hosting and GitHub Pages and that Home remains usable across desktop, tablet, and mobile.

- [ ] **Step 1: Run both production builds**

Run:

```bash
npm run build
npm run build:pages
```

Expected: both commands exit with code 0; the Pages build creates `dist/index.html` and `dist/404.html` with `/Test20260703/` asset paths.

- [ ] **Step 2: Inspect the Home at desktop width**

Start the dev server with:

```bash
npm run dev -- --host 127.0.0.1
```

Open the authenticated Home at desktop width and verify: one-row header, SunShinSon heading, featured learning card spanning half the dashboard, all four cards clickable, and no horizontal overflow.

- [ ] **Step 3: Inspect tablet and mobile widths**

At tablet width verify the featured card spans the dashboard and game cards use two columns. At mobile width verify one-column cards, compact header, minimum comfortable touch targets, visible focus state, and `document.documentElement.scrollWidth <= window.innerWidth`.

- [ ] **Step 4: Verify destinations and console health**

Activate each card once and confirm the exact destinations from Task 1. Return to Home between checks and confirm the browser console contains no new errors.

- [ ] **Step 5: Run fresh final verification**

Run:

```bash
git diff --check
npm test
npm run build
npm run build:pages
git status --short
```

Expected: no whitespace errors; all tests pass; both builds exit 0; status lists only intentional source/test changes or is clean after task commits.
