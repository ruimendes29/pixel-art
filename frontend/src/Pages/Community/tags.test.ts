import { describe, expect, it } from "vitest";
import { hasTag, toggleTag } from "./tags";

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
});
