import assert from "node:assert/strict";
import { test } from "node:test";
import { formatAed, formatAedCompact, formatPct, humanizeTag } from "./format.ts";

test("formatAed adds thousands separators and AED prefix", () => {
  assert.equal(formatAed(1126000), "AED 1,126,000");
  assert.equal(formatAed(950.6), "AED 951");
});

test("formatAedCompact abbreviates millions and thousands", () => {
  assert.equal(formatAedCompact(1126000), "AED 1.13M");
  assert.equal(formatAedCompact(70000), "AED 70K");
  assert.equal(formatAedCompact(500), "AED 500");
});

test("formatPct renders one decimal by default", () => {
  assert.equal(formatPct(6.1234), "6.1%");
  assert.equal(formatPct(6.1234, 2), "6.12%");
});

test("humanizeTag title-cases hyphenated tags", () => {
  assert.equal(humanizeTag("schools-nearby"), "Schools Nearby");
  assert.equal(humanizeTag("golf"), "Golf");
});
