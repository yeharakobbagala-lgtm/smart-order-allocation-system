/**
 * Node smoke test for reservation expiry parsing.
 * Run: npx --yes tsx src/lib/datetime.expiry.test.ts
 */
import {
  parseServerDate,
  secondsUntilExpiry,
} from "./datetime";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// Naive UTC string (what FastAPI used to emit) must NOT be treated as local.
const naiveUtc = "2026-09-17T08:52:30.000";
const parsed = parseServerDate(naiveUtc);
assert(
  parsed.toISOString() === "2026-09-17T08:52:30.000Z",
  `expected UTC parse, got ${parsed.toISOString()}`
);

// Future expiry (~10 min) must report positive remaining seconds
const future = new Date(Date.now() + 10 * 60 * 1000).toISOString().replace("Z", "");
const left = secondsUntilExpiry(future);
assert(left > 590 && left <= 600, `expected ~600s left, got ${left}`);

// Past expiry
assert(secondsUntilExpiry("2000-01-01T00:00:00") === 0, "past should be 0");

console.log("datetime expiry tests ok");
