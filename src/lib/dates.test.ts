import assert from "node:assert/strict";
import test from "node:test";
import { selectableDate } from "./dates";

const today = "2026-10-23";

test("keeps today and future dates in the schedule range", () => {
  assert.equal(selectableDate(today, today, 11), today);
  assert.equal(selectableDate("2026-11-15", today, 11), "2026-11-15");
  assert.equal(selectableDate("2027-09-30", today, 11), "2027-09-30");
});

test("ignores past dates and dates beyond the last displayed month", () => {
  assert.equal(selectableDate("2026-10-22", today, 11), null);
  assert.equal(selectableDate("2027-10-01", today, 11), null);
});

test("ignores missing, repeated or malformed URL date parameters", () => {
  for (const value of [undefined, null, ["2026-11-15"], "", "2026-1-1", "invalid", "2026-13-01"]) {
    assert.equal(selectableDate(value, today, 11), null);
  }
});

test("validates real calendar days including leap years", () => {
  assert.equal(selectableDate("2026-11-31", today, 11), null);
  assert.equal(selectableDate("2027-02-29", today, 11), null);
  assert.equal(selectableDate("2024-02-29", "2024-02-01", 0), "2024-02-29");
  assert.equal(selectableDate("2024-02-30", "2024-02-01", 0), null);
});
