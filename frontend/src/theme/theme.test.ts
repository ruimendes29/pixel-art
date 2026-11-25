import { describe, expect, it } from "vitest";
import { parsePreference, resolveTheme } from "./theme";

describe("theme preference", () => {
  it("only accepts light and dark, anything else follows the system", () => {
    expect(parsePreference("light")).toBe("light");
    expect(parsePreference("dark")).toBe("dark");
    expect(parsePreference(null)).toBe("system");
    expect(parsePreference("purple")).toBe("system");
  });

  it("system follows the OS, an explicit choice wins over it", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});
