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
$PNPM dev -- --open
status=$?

if [ "$status" -ne 0 ] && [ "$status" -ne 130 ]; then
  pause_and_exit "The local page could not be started."
fi
