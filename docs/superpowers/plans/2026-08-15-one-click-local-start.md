# One-click Local Start Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-click macOS and Windows launchers that install project dependencies, start Vite, and open the local page.

**Architecture:** Two repository-root launchers contain small platform-native wrappers with equivalent behavior. A Node test enforces their shared contract without attempting to execute Windows batch files on macOS.

**Tech Stack:** POSIX shell, Windows Batch, Node.js built-in test runner, pnpm, Vite

## Global Constraints

- Create `Start Local.command` for macOS and `Start Local.bat` for Windows in the repository root.
- Resolve the project directory from each launcher's own location, including paths containing spaces.
- Require Node.js and use standalone pnpm or Corepack's pnpm fallback.
- Run `pnpm install` before starting `pnpm dev --open`.
- Keep readable failures visible and do not install global packages automatically.
- Keep the development server attached until `Ctrl+C` or terminal closure.

---

### Task 1: Cross-platform launcher contract and implementation

**Files:**
- Create: `scripts/start-local.check.mjs`
- Create: `Start Local.command`
- Create: `Start Local.bat`

**Interfaces:**
- Consumes: the existing `package.json` scripts `dev` and the declared pnpm package manager.
- Produces: two double-click launchers with equivalent install/start behavior; `scripts/start-local.check.mjs` is their static cross-platform contract check.

- [ ] **Step 1: Write the failing launcher contract test**

Create `scripts/start-local.check.mjs`:

```js
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const root = new URL("../", import.meta.url);
const macPath = new URL("Start%20Local.command", root);
const windowsPath = new URL("Start%20Local.bat", root);

test("macOS launcher satisfies the one-click contract", async () => {
  const [source, metadata] = await Promise.all([
    readFile(macPath, "utf8"),
    stat(macPath),
  ]);

  assert.match(source, /^#!\/bin\/sh/);
  assert.match(source, /dirname -- "\$0"/);
  assert.match(source, /command -v node/);
  assert.match(source, /command -v pnpm/);
  assert.match(source, /command -v corepack/);
  assert.match(source, /\$PNPM install/);
  assert.match(source, /\$PNPM dev --open/);
  assert.notEqual(metadata.mode & 0o111, 0);
});

test("Windows launcher satisfies the one-click contract", async () => {
  const source = await readFile(windowsPath, "utf8");

  assert.match(source, /pushd "%~dp0"/i);
  assert.match(source, /if errorlevel 1 goto directory_failed/i);
  assert.match(source, /where node/i);
  assert.match(source, /where pnpm/i);
  assert.match(source, /where corepack/i);
  assert.match(source, /call %PNPM% install/i);
  assert.match(source, /call %PNPM% dev --open/i);
  assert.match(source, /popd/i);
  assert.match(source, /pause/i);
});

test(
  "Windows launcher installs before starting Vite from its own directory",
  { skip: process.platform !== "win32" },
  async () => {
    const sandbox = await mkdtemp(join(tmpdir(), "start-local-"));
    const fakeBin = join(sandbox, "fake bin");
    const project = join(sandbox, "project with spaces");
    const launcher = join(project, "Start Local.bat");
    const log = join(sandbox, "pnpm.log");
    const pathKey =
      Object.keys(process.env).find((key) => key.toLowerCase() === "path") ??
      "PATH";
    const env = { ...process.env, TEST_LOG: log };
    env[pathKey] = `${fakeBin};${process.env[pathKey] ?? ""}`;

    try {
      await Promise.all([mkdir(fakeBin), mkdir(project)]);
      await Promise.all([
        copyFile(windowsPath, launcher),
        writeFile(join(fakeBin, "node.cmd"), "@exit /b 0\r\n"),
        writeFile(
          join(fakeBin, "pnpm.cmd"),
          '@echo %CD%^|%*>>"%TEST_LOG%"\r\n@exit /b 0\r\n',
        ),
      ]);

      await execFileAsync("cmd.exe", ["/d", "/c", launcher], {
        cwd: sandbox,
        env,
      });

      const calls = (await readFile(log, "utf8")).trim().split(/\r?\n/);
      assert.deepEqual(calls, [
        `${project}|install`,
        `${project}|dev --open`,
      ]);
    } finally {
      await rm(sandbox, { recursive: true, force: true });
    }
  },
);
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `node --test scripts/start-local.check.mjs`

Expected: FAIL with `ENOENT` because the two launchers do not exist yet.

- [ ] **Step 3: Implement the macOS launcher**

Create `Start Local.command`:

```sh
#!/bin/sh

pause_and_exit() {
  printf "\n%s\n" "$1"
  printf "Press Enter to close this window..."
  read -r _
  exit 1
}

cd -- "$(dirname -- "$0")" || pause_and_exit "Could not open the project folder."

command -v node >/dev/null 2>&1 || pause_and_exit "Node.js is required. Install it from https://nodejs.org and try again."

if command -v pnpm >/dev/null 2>&1; then
  PNPM="pnpm"
elif command -v corepack >/dev/null 2>&1; then
  PNPM="corepack pnpm"
else
  pause_and_exit "pnpm is required. Enable Corepack or install pnpm, then try again."
fi

printf "Preparing dependencies...\n"
$PNPM install || pause_and_exit "Dependency installation failed."

printf "Starting the local page...\n"
$PNPM dev --open
status=$?

if [ "$status" -ne 0 ] && [ "$status" -ne 130 ]; then
  pause_and_exit "The local page could not be started."
fi
```

Run: `chmod +x "Start Local.command"`

- [ ] **Step 4: Implement the Windows launcher**

Create `Start Local.bat`:

```bat
@echo off
setlocal
pushd "%~dp0"
if errorlevel 1 goto directory_failed

where node >nul 2>&1
if errorlevel 1 goto node_missing

where pnpm >nul 2>&1
if not errorlevel 1 (
  set "PNPM=pnpm"
) else (
  where corepack >nul 2>&1
  if errorlevel 1 goto pnpm_missing
  set "PNPM=corepack pnpm"
)

echo Preparing dependencies...
call %PNPM% install
if errorlevel 1 goto install_failed

echo Starting the local page...
call %PNPM% dev --open
if errorlevel 1 goto start_failed
popd
exit /b 0

:node_missing
echo Node.js is required. Install it from https://nodejs.org and try again.
goto failed

:pnpm_missing
echo pnpm is required. Enable Corepack or install pnpm, then try again.
goto failed

:install_failed
echo Dependency installation failed.
goto failed

:start_failed
echo The local page could not be started.

:failed
popd
echo.
pause
exit /b 1

:directory_failed
echo Could not open the project folder.
echo.
pause
exit /b 1
```

- [ ] **Step 5: Run focused checks**

Run: `node --test scripts/start-local.check.mjs`

Expected: 2 tests pass.

Run: `sh -n "Start Local.command"`

Expected: exit status 0 with no output.

- [ ] **Step 6: Commit the launchers and contract test**

```bash
git add "Start Local.command" "Start Local.bat" scripts/start-local.check.mjs
git commit -m "feat: add one-click local launchers"
```

### Task 2: Full build and macOS smoke verification

**Files:**
- Verify only: `Start Local.command`, `Start Local.bat`, `scripts/start-local.check.mjs`

**Interfaces:**
- Consumes: the launchers produced by Task 1.
- Produces: evidence that the application still builds and that the macOS launcher reaches a live Vite server.

- [ ] **Step 1: Run the complete project test suite**

Run: `pnpm test`

Expected: all Vitest tests pass.

- [ ] **Step 2: Run the production build**

Run: `pnpm build`

Expected: TypeScript and Vite build successfully with exit status 0.

- [ ] **Step 3: Start the macOS launcher without opening a real browser**

Run in a managed terminal session: `BROWSER=none ./Start\ Local.command`

Expected: dependency installation succeeds and Vite prints a local URL. Keep the session identifier for shutdown.

- [ ] **Step 4: Confirm the served page responds**

Run: `curl --fail --silent --show-error http://localhost:5173/`

Expected: exit status 0 and an HTML response containing the application root document.

- [ ] **Step 5: Stop the smoke-test server cleanly**

Send `Ctrl+C` to the managed terminal session.

Expected: Vite stops and the launcher exits without an error prompt.

- [ ] **Step 6: Confirm the worktree is clean after the implementation commit**

Run: `git status --short`

Expected: no output.
