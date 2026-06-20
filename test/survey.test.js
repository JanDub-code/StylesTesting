const test = require("node:test");
const assert = require("node:assert/strict");
const { DESIGNS, validateSubmission, normalizeScore, csvEscape } = require("../lib/survey");

test("normalizeScore accepts only whole numbers from 0 to 100", () => {
  assert.equal(normalizeScore(0), 0);
  assert.equal(normalizeScore("100"), 100);
  assert.equal(normalizeScore(42), 42);
  assert.equal(normalizeScore(42.5), null);
  assert.equal(normalizeScore(-1), null);
  assert.equal(normalizeScore(101), null);
  assert.equal(normalizeScore(""), null);
});

test("validateSubmission requires age and all six design scores", () => {
  const invalid = validateSubmission({
    clientId: "client-1",
    ageRange: "",
    scores: []
  });

  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes("vekovou")));
  assert.ok(invalid.errors.some((error) => error.includes("6 navrhu")));
});

test("validateSubmission rejects malformed payloads without throwing", () => {
  assert.doesNotThrow(() => validateSubmission(null));

  const invalid = validateSubmission({
    clientId: "client-1",
    ageRange: "25-34",
    scores: [null, "bad", 42, ...DESIGNS.slice(3).map((design) => ({ designId: design.id, score: 50 }))]
  });

  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes("Neznamy navrh")));
});

test("validateSubmission accepts a complete anonymous vote", () => {
  const payload = {
    clientId: "client-1",
    ageRange: "25-34",
    displayOrder: DESIGNS.map((design) => design.id).reverse(),
    scores: DESIGNS.map((design, index) => ({
      designId: design.id,
      score: index * 10,
      note: "  funguje dobre  "
    }))
  };

  const result = validateSubmission(payload);
  assert.equal(result.valid, true);
  assert.equal(result.value.scores.length, DESIGNS.length);
  assert.equal(result.value.scores[0].note, "funguje dobre");
  assert.deepEqual(result.value.displayOrder, payload.displayOrder);
});

test("csvEscape escapes quotes, commas and line breaks", () => {
  assert.equal(csvEscape("bez problemu"), "bez problemu");
  assert.equal(csvEscape('Ahoj, "test"'), '"Ahoj, ""test"""');
  assert.equal(csvEscape("radek\nnovy"), '"radek\nnovy"');
});
