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
