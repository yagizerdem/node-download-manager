import HttpStatusCode from "./http-status-code.ts";

// retry.ts — full-jitter exponential backoff with deadline + abort
export class NonRetryableError extends Error {
  constructor(public cause: unknown) {
    super("non-retryable");
  }
}

export type RetryOptions = {
  maxAttempts?: number; // default 5
  baseMs?: number; // default 100
  capMs?: number; // default 30_000
  deadlineMs?: number; // total wall-clock budget
  signal?: AbortSignal; // external cancellation
  shouldRetry?: (err: unknown) => boolean;
  onRetry?: (info: {
    attempt: number;
    delayMs: number;
    error: unknown;
  }) => void;
};

export type Attempt = {
  attempt: number; // 1-indexed
  signal: AbortSignal; // honour this in your fetch
};

const defaultShouldRetry = (err: unknown): boolean => {
  if (err instanceof NonRetryableError) return false;
  const code = (err as { code?: string })?.code;
  if (
    code &&
    ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN"].includes(code)
  )
    return true;
  const status = (err as { status?: number })?.status;
  if (
    status &&
    [
      HttpStatusCode.REQUEST_TIMEOUT,
      HttpStatusCode.TOO_MANY_REQUESTS,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      HttpStatusCode.BAD_GATEWAY,
      HttpStatusCode.SERVICE_UNAVAILABLE,
      HttpStatusCode.GATEWAY_TIMEOUT,
    ].includes(status)
  )
    return true;
  return false;
};

const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(signal.reason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });

const retryAfterMs = (err: unknown): number | null => {
  const header = (err as { retryAfter?: string })?.retryAfter;
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
};

export async function withRetry<T>(
  op: (a: Attempt) => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 5;
  const baseMs = opts.baseMs ?? 100;
  const capMs = opts.capMs ?? 30_000;
  const shouldRetry = opts.shouldRetry ?? defaultShouldRetry;
  const deadline = opts.deadlineMs
    ? AbortSignal.timeout(opts.deadlineMs)
    : null;
  const signal: AbortSignal =
    deadline && opts.signal
      ? AbortSignal.any([opts.signal, deadline])
      : (deadline ?? opts.signal ?? new AbortController().signal);

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal.aborted) throw signal.reason;
    try {
      return await op({ attempt, signal });
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      if (!shouldRetry(err)) throw err;
      const expo = Math.min(capMs, baseMs * 2 ** (attempt - 1));
      const jittered = Math.random() * expo;
      const hint = retryAfterMs(err);
      const delayMs = hint !== null ? Math.max(jittered, hint) : jittered;
      opts.onRetry?.({ attempt, delayMs, error: err });
      await sleep(delayMs, signal);
    }
  }
  throw lastError;
}
