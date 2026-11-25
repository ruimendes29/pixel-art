import { describe, expect, it } from "vitest";
import { cellAt, cellsBetween, initialCells, SIZE } from "./PracticeGrid";

const rect = { left: 100, top: 50, width: 160, height: 160 }; // 10px cells

describe("cellAt", () => {
  it("finds the cell under the pointer", () => {
    expect(cellAt(rect, 100, 50)).toBe(0);
    expect(cellAt(rect, 125, 65)).toBe(1 * SIZE + 2);
    expect(cellAt(rect, 259, 209)).toBe(SIZE * SIZE - 1);
  });

  it("returns -1 outside the grid", () => {
    expect(cellAt(rect, 99, 60)).toBe(-1);
    expect(cellAt(rect, 260, 60)).toBe(-1);
    expect(cellAt(rect, 150, 210)).toBe(-1);
  });
});

describe("cellsBetween", () => {
  it("fills every cell of a fast diagonal stroke", () => {
    expect(cellsBetween(0, 3 * SIZE + 3)).toEqual([0, SIZE + 1, 2 * SIZE + 2, 3 * SIZE + 3]);
  });

  it("is just the cell when the pointer did not leave it", () => {
    expect(cellsBetween(5, 5)).toEqual([5]);
  });

  it("never jumps a row on a long horizontal stroke", () => {
    const line = cellsBetween(2 * SIZE, 2 * SIZE + 15);
    expect(line).toHaveLength(16);
    expect(line.every((i) => Math.floor(i / SIZE) === 2)).toBe(true);
  });
});

it("starts with a drawing on a 16x16 grid", () => {
  const cells = initialCells();
  expect(cells).toHaveLength(SIZE * SIZE);
  expect(cells.some(Boolean)).toBe(true);
});
