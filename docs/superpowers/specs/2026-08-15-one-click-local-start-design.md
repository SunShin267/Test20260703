# One-click local start design

## Goal

Allow a user to start the local Vite page by double-clicking one file on macOS or Windows, without manually opening a terminal or remembering project commands.

## Files

- `Start Local.command` supports macOS.
- `Start Local.bat` supports Windows.

Both files live in the repository root so they are immediately visible and can reliably resolve the project directory from their own location.

## Startup flow

Each launcher will:

1. Change the working directory to the repository root.
2. Verify that Node.js is available.
3. Use the project's pnpm package manager, falling back to Corepack when a standalone `pnpm` command is unavailable.
4. Run `pnpm install` so missing or outdated dependencies are prepared automatically.
5. Run `pnpm dev -- --open` so Vite starts and opens the local page in the default browser.
6. Keep the terminal attached to the development server until the user presses `Ctrl+C` or closes the window.

## Error handling

If Node.js, pnpm/Corepack, dependency installation, or Vite startup fails, the launcher will show a concise error message and keep the terminal visible long enough for the user to read it. No global packages will be installed automatically.

## Platform details

The macOS launcher will use POSIX shell syntax and be committed with its executable bit set. The Windows launcher will use batch syntax and quote its project path so folders containing spaces work correctly.

## Verification

- Check the macOS script syntax with `sh -n`.
- Check that both launchers resolve the repository root and contain the expected install/start commands.
- Run the existing project build to confirm the launchers do not disturb the application build.
- Perform a bounded smoke test of the macOS launcher and confirm Vite serves the page locally.
