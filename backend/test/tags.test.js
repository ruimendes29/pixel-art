const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeTags,
  parseTagsQuery,
  parseSearchQuery,
  escapeLike,
  MAX_TAGS,
} = require("../resources/tags");

test("normalizeTags trims, collapses spaces and drops blanks", () => {
  assert.deepEqual(normalizeTags(["  Retro   games ", "", "   "]), ["Retro games"]);
});

test("normalizeTags removes duplicates that differ only in case", () => {
  assert.deepEqual(normalizeTags(["Cats", "cats", "CATS ", "Dogs"]), ["Cats", "Dogs"]);
});

test("normalizeTags cuts tags to 50 characters", () => {
  assert.equal(normalizeTags(["x".repeat(80)])[0].length, 50);
});

test("normalizeTags rejects anything that is not a list of text", () => {
  assert.throws(() => normalizeTags("Cats"), /list/);
  assert.throws(() => normalizeTags([1]), /text/);
});

test("normalizeTags limits the number of tags", () => {
  const many = Array.from({ length: MAX_TAGS + 1 }, (_, i) => `tag ${i}`);
  assert.throws(() => normalizeTags(many), /at most/);
});

test("parseTagsQuery reads the ?tags= JSON list", () => {
  assert.deepEqual(parseTagsQuery(undefined), []);
  assert.deepEqual(parseTagsQuery(""), []);
  assert.deepEqual(parseTagsQuery('["Cats"," Retro "]'), ["Cats", "Retro"]);
  assert.throws(() => parseTagsQuery("Cats"), /JSON list/);
});

test("parseSearchQuery trims and limits the search text", () => {
  assert.equal(parseSearchQuery("  pixel   cat "), "pixel cat");
  assert.equal(parseSearchQuery(undefined), "");
  assert.equal(parseSearchQuery(["a"]), "");
  assert.equal(parseSearchQuery("x".repeat(150)).length, 100);
});

test("escapeLike escapes LIKE wildcards", () => {
  assert.equal(escapeLike("100%_a\\b"), "100\\%\\_a\\\\b");
});
