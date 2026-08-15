import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

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
  assert.match(source, /\$PNPM dev -- --open/);
  assert.notEqual(metadata.mode & 0o111, 0);
});

test("Windows launcher satisfies the one-click contract", async () => {
  const source = await readFile(windowsPath, "utf8");

  assert.match(source, /cd \/d "%~dp0"/i);
  assert.match(source, /where node/i);
  assert.match(source, /where pnpm/i);
  assert.match(source, /where corepack/i);
  assert.match(source, /call %PNPM% install/i);
  assert.match(source, /call %PNPM% dev -- --open/i);
  assert.match(source, /pause/i);
});
