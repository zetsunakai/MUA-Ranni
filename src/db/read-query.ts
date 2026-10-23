import "server-only";

// Hanya untuk SELECT. Jangan gunakan pada mutasi/transaction: hasil penulisan
// yang terputus bisa sudah tersimpan, sehingga mengulangnya berisiko menggandakan data.
const CONNECTION_ERRORS = new Set([
  "ECONNREFUSED", "ECONNRESET", "EPIPE", "ETIMEDOUT", "EHOSTUNREACH",
  "ENETUNREACH", "EAI_AGAIN", "57P01", "57P02", "57P03",
]);

function isConnectionError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current = error;
  while (current instanceof Error && !seen.has(current)) {
    seen.add(current);
    const code = (current as Error & { code?: string }).code;
    if (code && (CONNECTION_ERRORS.has(code) || /^08\d{3}$/.test(code))) return true;
    // pg pool connection timeouts and closed sockets do not always carry a code.
    if (/^(timeout exceeded when trying to connect|connection terminated unexpectedly|connection terminated due to connection timeout|query read timeout)$/i.test(current.message)) return true;
    current = current.cause;
  }
  return false;
}

export async function readWithRetry<T>(read: () => PromiseLike<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!isConnectionError(error)) throw error;
    // Run a new SELECT so the pool can acquire a healthy connection. A second
    // failure is propagated; schema/authentication errors never get retried.
    return await read();
  }
}
