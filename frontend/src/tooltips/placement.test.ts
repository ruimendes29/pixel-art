import { describe, expect, it } from "vitest";
import { placeTooltip } from "./placement";

const viewport = { width: 1000, height: 800 };
const tip = { width: 200, height: 40 };

describe("placeTooltip", () => {
  it("goes on the preferred side when it fits", () => {
    const anchor = { top: 300, bottom: 340, left: 400, width: 40 };
    expect(placeTooltip(anchor, tip, viewport, "top")).toEqual({ top: 252, left: 320, placement: "top" });
    expect(placeTooltip(anchor, tip, viewport, "bottom")).toEqual({ top: 348, left: 320, placement: "bottom" });
  });

  it("flips to the other side when the preferred one has no room", () => {
    const nearTop = { top: 10, bottom: 50, left: 400, width: 40 };
    expect(placeTooltip(nearTop, tip, viewport, "top").placement).toBe("bottom");
    const nearBottom = { top: 750, bottom: 790, left: 400, width: 40 };
    expect(placeTooltip(nearBottom, tip, viewport, "bottom").placement).toBe("top");
  });

  it("stays inside the screen edges", () => {
    const right = { top: 300, bottom: 340, left: 980, width: 20 };
    expect(placeTooltip(right, tip, viewport).left).toBe(1000 - 8 - 200);
    const left = { top: 300, bottom: 340, left: 0, width: 20 };
    expect(placeTooltip(left, tip, viewport).left).toBe(8);
  });
});
