import { describe, expect, it } from "vitest";
import cases from "./cases.json";
import { checkSpec, FieldKey, validateField } from "./validate";

// Same cases as backend/test/fields.test.js: both sides must give the same answer
describe("shared field rules", () => {
  it.each(cases as [FieldKey, unknown, string | null][])("%s %j", (key, value, expected) => {
    expect(validateField(key, value)).toBe(expected);
  });

  it("every field has what its type requires", () => {
    expect(checkSpec).not.toThrow();
  });
});
