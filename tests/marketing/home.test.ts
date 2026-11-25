// Spec 0019 AC-3, AC-4: the homepage copy helpers and the trial numbers the copy is filled from.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fill, splitHighlight } from "../../src/lib/marketing/home.ts";

test("fill inserts each value exactly as stored", () => {
  assert.equal(
    fill("Free for {freeDays} days, then TZS {tzsYear} a year.", { freeDays: 21, tzsYear: "300,000" }),
    "Free for 21 days, then TZS 300,000 a year.",
  );
  assert.equal(fill("${usdYear} a year", { usdYear: "399" }), "$399 a year");
});

test("fill throws on a placeholder with no value", () => {
  assert.throws(() => fill("Decide by day {removedOnDay}", {}), /removedOnDay/);
});

test("splitHighlight finds the one highlighted word", () => {
  assert.deepEqual(splitHighlight("Your stock and sales, always *current*"), [
    "Your stock and sales, always ",
    "current",
    "",
  ]);
  assert.deepEqual(splitHighlight("Stop dreading your books. Start *trusting* them."), [
    "Stop dreading your books. Start ",
    "trusting",
    " them.",
  ]);
  assert.deepEqual(splitHighlight("No highlight"), ["No highlight", "", ""]);
});
