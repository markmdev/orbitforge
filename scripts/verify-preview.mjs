import { spawn } from 'node:child_process';

const host = process.env.ORBITFORGE_PREVIEW_HOST ?? '127.0.0.1';
const port = process.env.ORBITFORGE_PREVIEW_PORT ?? '4173';
const baseUrl = process.env.ORBITFORGE_PREVIEW_BASE_URL ?? `http://${host}:${port}`;
const startupTimeoutMs = Number(process.env.ORBITFORGE_PREVIEW_TIMEOUT_MS ?? 15_000);

let previewExited = false;
let previewExitDetail = 'preview process has not exited';

const preview = spawn('npm', ['run', 'preview', '--', '--host', host, '--port', port], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

preview.stdout.on('data', (chunk) => process.stdout.write(prefixLines('preview', chunk)));
preview.stderr.on('data', (chunk) => process.stderr.write(prefixLines('preview', chunk)));
preview.once('exit', (code, signal) => {
  previewExited = true;
  previewExitDetail = `preview exited with ${signal ?? code}`;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await stopPreview();
    process.kill(process.pid, signal);
  });
}

try {
  await waitForPreview();
  await runRuntimeVerifier();
  await stopPreview();
} catch (error) {
  await stopPreview();
  console.error(`fail preview ${error instanceof Error ? error.message : 'unknown preview verification failure'}`);
  process.exit(1);
}

async function waitForPreview() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (previewExited) {
      throw new Error(previewExitDetail);
    }

    try {
      const response = await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) {
        console.log(`pass preview reachable at ${baseUrl}`);
        return;
      }
    } catch {
      // Vite preview is still starting.
    }

    await delay(250);
  }

  throw new Error(`timed out waiting for ${baseUrl}`);
}

async function runRuntimeVerifier() {
  await runCommand(process.execPath, ['scripts/verify-runtime.mjs'], {
    ...process.env,
    ORBITFORGE_BASE_URL: baseUrl,
  });
}

function runCommand(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
    });

    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with ${signal ?? code}`));
    });
  });
}

async function stopPreview() {
  if (previewExited) {
    return;
  }

  preview.kill('SIGTERM');

  const stopped = await Promise.race([
    onceExit(preview).then(() => true),
    delay(2_000).then(() => false),
  ]);

  if (!stopped && !previewExited) {
    preview.kill('SIGKILL');
    await onceExit(preview);
  }
}

function onceExit(child) {
  if (previewExited) {
    return Promise.resolve();
  }

  return new Promise((resolve) => child.once('exit', resolve));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prefixLines(label, chunk) {
  return String(chunk)
    .split(/(?<=\n)/)
    .map((line) => (line.trim().length === 0 ? line : `[${label}] ${line}`))
    .join('');
}
