import { test } from "node:test";
import assert from "node:assert/strict";
import { readWords } from "./read-words.ts";

const labels = (t: string) => readWords(t).map((c) => c.label);

test("reads rooms, type, budget and commute", () => {
  assert.deepEqual(labels("A bright flat near a park, two beds, under £500k, 25 minutes to King's Cross."),
    ["2 bed", "Flat", "≤ £500k", "≤ 25 min to King's Cross", "Park ≤ 5 min", "Good natural light"]);
});

test("normalises bare and million prices", () => {
  assert.ok(labels("house under £1.2m").includes("≤ £1.2m"));
  assert.ok(labels("house under £650,000").includes("≤ £650k"));
});

test("marks feelings as guesses", () => {
  const quiet = readWords("somewhere quiet").find((c) => c.label === "Low-traffic street");
  assert.equal(quiet?.guess, true);
  assert.equal(readWords("with a garden")[0].guess, false);
});

test("returns nothing for empty words", () => {
  assert.deepEqual(readWords("hello"), []);
});
