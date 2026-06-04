import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const baseUrl = "http://localhost:3000";
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const playwrightCli = path.join(rootDir, "node_modules", "playwright", "cli.js");
const isUiMode = process.argv.includes("--ui");
const passthroughArgs = process.argv.slice(2).filter((argument) => argument !== "--ui" && argument !== "--");

function spawnNode(args) {
  return spawn(process.execPath, args, {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
    shell: false
  });
}

function spawnPlaywright(args) {
  return spawn(process.execPath, args, {
    cwd: rootDir,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false
  });
}

async function canReachServer() {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1_000) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(timeoutMs = 120_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await canReachServer()) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Next.js server did not become ready at ${baseUrl}`);
}

function killTree(child) {
  if (!child || child.killed) return;

  if (process.platform === "win32" && child.pid) {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      shell: false
    });
    killer.unref();
    return;
  }

  child.kill("SIGTERM");
}

let serverProcess;
const serverAlreadyRunning = await canReachServer();

try {
  if (!serverAlreadyRunning) {
    serverProcess = spawnNode([nextBin, "dev", "--hostname", "127.0.0.1", "--port", "3000"]);
    await waitForServer();
  }

  const playwrightArgs = [playwrightCli, "test"];
  if (isUiMode) playwrightArgs.push("--ui");
  playwrightArgs.push(...passthroughArgs);

  const testProcess = spawnPlaywright(playwrightArgs);
  let output = "";
  let resolved = false;

  const exitCode = await new Promise((resolve) => {
    function resolveOnce(code) {
      if (resolved) return;
      resolved = true;
      resolve(code);
    }

    function handleOutput(chunk) {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);

      const hasFinalSummary = /\d+\s+(passed|failed|flaky|skipped)\s+\(/i.test(output);
      if (!hasFinalSummary || isUiMode) return;

      const hasFailure = /\d+\s+failed\s+\(/i.test(output);
      if (!testProcess.killed) testProcess.kill();
      resolveOnce(hasFailure ? 1 : 0);
    }

    testProcess.stdout?.on("data", handleOutput);
    testProcess.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
      handleOutput(Buffer.from(""));
    });
    testProcess.on("exit", (code) => resolveOnce(code ?? 0));
  });

  process.exitCode = exitCode;
} finally {
  if (!serverAlreadyRunning && serverProcess) killTree(serverProcess);
}

process.exit(process.exitCode ?? 0);
