import { describe, expect, it } from "vitest";
import { countMetRules, isPasswordStrong } from "./password-rules";

describe("password rules", () => {
  it("counts each rule met", () => {
    expect(countMetRules("")).toBe(0);
    expect(countMetRules("abc")).toBe(1);
    expect(countMetRules("abcABC")).toBe(2);
    expect(countMetRules("abcABC12")).toBe(4);
    expect(countMetRules("abcABC1!")).toBe(5);
  });

  it("needs every rule to be strong", () => {
    expect(isPasswordStrong("aB1!")).toBe(false); // too short
    expect(isPasswordStrong("abcdefgh")).toBe(false);
    expect(isPasswordStrong("Pixel-art9")).toBe(true);
  });
});
