const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateField, assertFields, checkSpec, ValidationError } = require("../resources/fields");
const cases = require("../../frontend/src/fields/cases.json");

// Same cases as frontend/src/fields/fields.test.ts: both sides must give the same answer
for (const [key, value, expected] of cases) {
  test(`${key} ${JSON.stringify(value)}`, () => {
    assert.equal(validateField(key, value).error, expected);
  });
}

test("a field without what its type requires is rejected", () => {
  const types = { textarea: { requires: ["maxLength"] } };
  assert.throws(() => checkSpec({ types, fields: { bio: { type: "textarea", label: "Bio" } } }), /needs "maxLength"/);
});

test("floats allow at most 2 decimal places", () => {
  const { spec } = require("../resources/fields");
  const types = { ...spec.types };
  const fields = { price: { type: "float", label: "Price", required: true, min: 0, max: 100 } };
  checkSpec({ types, fields });
  // validateField reads the real spec, so check the rule through a temporary field
  spec.fields.price = fields.price;
  try {
    assert.equal(validateField("price", "9.99").error, null);
    assert.equal(validateField("price", 9.5).error, null);
    assert.equal(validateField("price", "9.999").error, "Price can have at most 2 decimal places");
  } finally {
    delete spec.fields.price;
  }
});

test("assertFields returns cleaned values or throws a 400 with every problem", () => {
  assert.deepEqual(assertFields({ projectName: "  Cat  ", canvasSize: "32" }), {
    projectName: "Cat",
    canvasSize: 32,
  });
  assert.throws(
    () => assertFields({ projectName: "", canvasSize: 5 }),
    (err) =>
      err instanceof ValidationError &&
      err.status === 400 &&
      err.message === "Project name can't be empty. Canvas size must be between 10 and 100"
  );
});
