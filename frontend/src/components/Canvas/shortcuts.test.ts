import { describe, expect, it } from "vitest";
import { Brushes } from "./CanvasOperations/brushes";
import { isTypingTarget, SHORTCUTS, shortcutFor } from "./shortcuts";

const press = (key: string, mods: Partial<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean }> = {}) =>
  shortcutFor({ key, ctrlKey: false, metaKey: false, altKey: false, ...mods });

describe("editor shortcuts", () => {
  it("maps letters to tools, ignoring case", () => {
    expect(press("b")?.action).toEqual({ brush: Brushes.normal });
    expect(press("E")?.action).toEqual({ brush: Brushes.eraser });
    expect(press("h")?.action).toEqual({ panning: true });
  });

  it("accepts = and + for zoom in (same key on most keyboards)", () => {
    expect(press("=")?.action).toEqual({ brush: Brushes.zoomin });
    expect(press("+")?.action).toEqual({ brush: Brushes.zoomin });
  });

  it("leaves browser shortcuts alone", () => {
    expect(press("b", { ctrlKey: true })).toBeUndefined();
    expect(press("e", { metaKey: true })).toBeUndefined();
    expect(press("x")).toBeUndefined();
  });

  it("no two shortcuts share a key", () => {
    const keys = SHORTCUTS.flatMap((s) => s.triggers ?? []);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("knows when the user is typing", () => {
    expect(isTypingTarget({ tagName: "INPUT" } as any)).toBe(true);
    expect(isTypingTarget({ tagName: "DIV", isContentEditable: true } as any)).toBe(true);
    expect(isTypingTarget({ tagName: "CANVAS", isContentEditable: false } as any)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
