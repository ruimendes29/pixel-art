import { describe, expect, it } from "vitest";
import { hasTag, isPresetTag, MAX_TAG_LENGTH, normalizeTag, toggleTag } from "./tags";

describe("normalizeTag", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeTag("  Retro   games ")).toBe("Retro games");
  });

  it("returns an empty string for blank input", () => {
    expect(normalizeTag("   ")).toBe("");
  });

  it("uses the preset spelling when the tag matches one", () => {
    expect(normalizeTag("pokemon")).toBe("Pokemon");
    expect(normalizeTag("DEATH  note")).toBe("Death Note");
  });

  it("cuts tags to the database limit", () => {
    expect(normalizeTag("a".repeat(80))).toHaveLength(MAX_TAG_LENGTH);
  });
});

describe("toggleTag", () => {
  it("adds a tag that is not selected", () => {
    expect(toggleTag(["Cats"], "Retro")).toEqual(["Cats", "Retro"]);
  });

  it("removes a selected tag, ignoring case", () => {
    expect(toggleTag(["Cats", "Retro"], "retro")).toEqual(["Cats"]);
  });
});

describe("tag lookups", () => {
  it("finds tags ignoring case", () => {
    expect(hasTag(["Retro"], "RETRO")).toBe(true);
    expect(hasTag(["Retro"], "Retr")).toBe(false);
  });

  it("knows which tags are presets", () => {
    expect(isPresetTag("messi")).toBe(true);
    expect(isPresetTag("Retro")).toBe(false);
  });
});
