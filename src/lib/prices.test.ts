import assert from "node:assert/strict";
import test from "node:test";
import type { ServiceGroup } from "@/types";
import { lowestPrice } from "./prices";

function group(...prices: number[]): ServiceGroup {
  return { id: "test", name: "Paket", tier: "reguler", includes: [], order: 0,
    items: prices.map((price, index) => ({ id: String(index), name: `Layanan ${index}`, price })) };
}

test("no groups or no service items means no advertised minimum price", () => {
  assert.equal(lowestPrice([]), null);
  assert.equal(lowestPrice([group(), group()]), null);
});

test("finds the minimum across groups, including empty groups", () => {
  assert.equal(lowestPrice([group(), group(150_000, 75_000), group(225_000)]), 75_000);
});

test("zero is a valid price", () => {
  assert.equal(lowestPrice([group(150_000, 0)]), 0);
});

test("never advertises non-finite prices", () => {
  assert.equal(lowestPrice([group(Infinity, NaN)]), null);
  assert.equal(lowestPrice([group(Infinity, 150_000)]), 150_000);
});
