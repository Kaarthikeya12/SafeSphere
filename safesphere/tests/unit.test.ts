import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCountdown, normalizePhone, validatePhone } from "../src/lib/format.ts";
import { safeNext } from "../src/lib/redirect.ts";
import { INCIDENT_CATEGORIES, isIncidentCategory, ruleBasedTriage } from "../src/lib/triage.ts";

describe("rule-based triage baseline", () => {
  it("labels itself as the rule-based engine, never AI", () => {
    assert.equal(ruleBasedTriage("There is a fire in the kitchen").engine, "rule-based");
  });

  const cases: [string, string][] = [
    ["Water is rising fast near the bus stand, the road is flooded", "Flooding"],
    ["Water is rising fast near the bus stand and two scooters are stuck", "Flooding"],
    ["Thick smoke and flames coming out of the shop, gas cylinder inside", "Fire"],
    ["A bike and a car collided at the junction, rider injured on the road", "Road accident"],
    ["Open manhole with no cover and an exposed live wire on the footpath", "Infrastructure hazard"],
    ["A man has been following me and harassing women near the dark road", "Unsafe location"],
    ["Cyclone warning, strong wind and lightning, a tree fell on the wall", "Severe weather / natural hazard"],
  ];
  for (const [text, expected] of cases) {
    it(`suggests "${expected}"`, () => assert.equal(ruleBasedTriage(text).suggestedCategory, expected));
  }

  it("falls back to Other with low confidence when nothing matches", () => {
    const result = ruleBasedTriage("Something odd happened here earlier today");
    assert.equal(result.suggestedCategory, "Other");
    assert.equal(result.confidence, "low");
  });

  it("flags urgent cues so the UI can surface 112", () => {
    assert.ok(ruleBasedTriage("My friend collapsed and is not breathing").urgentCues.includes("not breathing"));
  });

  it("only ever returns allowed categories", () => {
    for (const text of ["flood fire crash", "random words", "pothole streetlight"]) {
      const result = ruleBasedTriage(text);
      assert.ok(isIncidentCategory(result.suggestedCategory));
      result.alternatives.forEach((alt) => assert.ok(INCIDENT_CATEGORIES.includes(alt)));
    }
  });
});

describe("phone validation", () => {
  it("accepts Indian mobiles and international numbers", () => {
    assert.equal(validatePhone("98765 43210"), null);
    assert.equal(validatePhone("+44 20 7946 0958"), null);
  });
  it("rejects bad input", () => {
    assert.ok(validatePhone(""));
    assert.ok(validatePhone("12345"));
    assert.ok(validatePhone("abc1234567"));
    assert.ok(validatePhone("1234567890"), "10-digit numbers must start with 6-9");
  });
  it("normalises formatting", () => assert.equal(normalizePhone("+91 98765-43210"), "+919876543210"));
});

describe("redirect safety", () => {
  it("allows same-site paths", () => assert.equal(safeNext("/dashboard#sos"), "/dashboard#sos"));
  it("blocks open redirects", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", undefined, ""]) assert.equal(safeNext(bad), "/dashboard");
  });
});

describe("countdown formatting", () => {
  it("formats and clamps", () => {
    assert.equal(formatCountdown(65_000), "01:05");
    assert.equal(formatCountdown(-5_000), "00:00");
  });
});
