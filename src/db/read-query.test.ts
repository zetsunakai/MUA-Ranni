import assert from "node:assert/strict";
import test from "node:test";
import { readWithRetry } from "./read-query";

function connectionError(code: string) {
  return Object.assign(new Error("connection lost"), { code });
}

test("returns the real query result without another read", async () => {
  let attempts = 0;
  const rows = [{ id: 1 }];
  assert.equal(await readWithRetry(async () => { attempts++; return rows; }), rows);
  assert.equal(attempts, 1);
});

test("recovers a connection error wrapped by Drizzle using a fresh read", async () => {
  let attempts = 0;
  const rows = [{ id: 1 }];
  const error = new Error("Failed query", { cause: connectionError("ECONNRESET") });
  assert.equal(await readWithRetry(async () => {
    if (++attempts === 1) throw error;
    return rows;
  }), rows);
  assert.equal(attempts, 2);
});

test("retries pg pool timeouts without an error code", async () => {
  let attempts = 0;
  const result = await readWithRetry(async () => {
    if (++attempts === 1) throw new Error("Failed query", { cause: new Error("timeout exceeded when trying to connect") });
    return "reconnected";
  });
  assert.equal(result, "reconnected");
  assert.equal(attempts, 2);
});

test("stops after the second connection failure and preserves its error", async () => {
  let attempts = 0;
  const first = connectionError("ETIMEDOUT"), second = connectionError("ECONNREFUSED");
  await assert.rejects(readWithRetry(async () => { throw ++attempts === 1 ? first : second; }), error => error === second);
  assert.equal(attempts, 2);
});

test("does not retry schema or authentication errors", async () => {
  for (const code of ["42P01", "42703", "28P01"]) {
    let attempts = 0;
    const error = new Error("Failed query", { cause: connectionError(code) });
    await assert.rejects(readWithRetry(async () => { attempts++; throw error; }), e => e === error);
    assert.equal(attempts, 1);
  }
});

test("does not replace application errors with fallback data", async () => {
  const error = new Error("invalid application result");
  let attempts = 0;
  await assert.rejects(readWithRetry(async () => { attempts++; throw error; }), e => e === error);
  assert.equal(attempts, 1);
});

test("recovers a pg query read timeout so a hung pool client can be discarded", async () => {
  let attempts = 0;
  const rows = [{ id: 1 }];
  assert.equal(await readWithRetry(async () => {
    if (++attempts === 1) throw new Error("Failed query", { cause: new Error("Query read timeout") });
    return rows;
  }), rows);
  assert.equal(attempts, 2);
});
