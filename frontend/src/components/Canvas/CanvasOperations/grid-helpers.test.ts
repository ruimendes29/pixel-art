import { describe, expect, it } from "vitest";
import {
  eraseCells,
  getBrushRadius,
  getCellAt,
  getCellColor,
  paintCells,
  PaintedSquares,
} from "./grid-helpers";

describe("getCellAt", () => {
  it("maps a point to its cell without zoom or pan", () => {
    expect(getCellAt(0, 0, 0, 0, 20)).toEqual({ col: 0, row: 0 });
    expect(getCellAt(19.9, 39.9, 0, 0, 20)).toEqual({ col: 0, row: 1 });
  });

  it("puts a point on a grid line in the next cell", () => {
    expect(getCellAt(20, 40, 0, 0, 20)).toEqual({ col: 1, row: 2 });
  });

  it("uses the zoomed square size", () => {
    // squareSize 20 at zoom 1, 2 and 0.5
    expect(getCellAt(79, 79, 0, 0, 20 * 1)).toEqual({ col: 3, row: 3 });
    expect(getCellAt(79, 79, 0, 0, 20 * 2)).toEqual({ col: 1, row: 1 });
    expect(getCellAt(79, 79, 0, 0, 20 * 0.5)).toEqual({ col: 7, row: 7 });
  });

  it("adds the pan offset, including fractional pans", () => {
    // panned 3 columns and 2 rows: the top-left pixel is cell (3, 2)
    expect(getCellAt(0, 0, -3, -2, 20)).toEqual({ col: 3, row: 2 });
    // panning moves in steps of 0.3 cells
    expect(getCellAt(13, 15, -0.3, -0.3, 20)).toEqual({ col: 0, row: 1 });
  });

  it("returns indices outside the grid for points outside the canvas", () => {
    // 20x20 grid of 20px squares: the canvas is 400px wide
    expect(getCellAt(-1, -1, 0, 0, 20)).toEqual({ col: -1, row: -1 });
    expect(getCellAt(400, 400, 0, 0, 20)).toEqual({ col: 20, row: 20 });
  });
});

describe("getBrushRadius", () => {
  it("rounds the slider value to whole cells", () => {
    expect(getBrushRadius(0)).toBe(0);
    expect(getBrushRadius(12)).toBe(0);
    expect(getBrushRadius(13)).toBe(1);
    expect(getBrushRadius(25)).toBe(1);
    expect(getBrushRadius(50)).toBe(2);
  });
});

describe("paintCells", () => {
  it("paints a single cell with radius 0", () => {
    const painted: PaintedSquares = new Map();
    paintCells(painted, 4, 2, 0, "#ff0000");
    expect(getCellColor(painted, 4, 2)).toBe("#ff0000");
    expect(painted.size).toBe(1);
    expect(painted.get(2)!.size).toBe(1);
  });

  it("paints a (2r+1) square around the centre", () => {
    const painted: PaintedSquares = new Map();
    paintCells(painted, 5, 5, 1, "#00ff00");
    for (let row = 4; row <= 6; row++) {
      for (let col = 4; col <= 6; col++) {
        expect(getCellColor(painted, col, row)).toBe("#00ff00");
      }
    }
    expect(getCellColor(painted, 7, 5)).toBeUndefined();
    expect(getCellColor(painted, 5, 3)).toBeUndefined();
  });

  it("overwrites a colour already in the cell", () => {
    const painted: PaintedSquares = new Map();
    paintCells(painted, 0, 0, 0, "#ff0000");
    paintCells(painted, 0, 0, 0, "#0000ff");
    expect(getCellColor(painted, 0, 0)).toBe("#0000ff");
  });

  it("does not clamp the brush at the grid edge", () => {
    const painted: PaintedSquares = new Map();
    paintCells(painted, 0, 0, 1, "#000000");
    expect(getCellColor(painted, -1, -1)).toBe("#000000");
  });
});

describe("eraseCells", () => {
  it("removes the colour from every cell under the brush", () => {
    const painted: PaintedSquares = new Map();
    paintCells(painted, 5, 5, 2, "#ff0000");
    eraseCells(painted, 5, 5, 1);
    expect(getCellColor(painted, 5, 5)).toBeUndefined();
    expect(getCellColor(painted, 4, 6)).toBeUndefined();
    // the outer ring of the radius-2 stroke stays
    expect(getCellColor(painted, 3, 5)).toBe("#ff0000");
    expect(getCellColor(painted, 7, 7)).toBe("#ff0000");
  });

  it("does nothing to colours when the cell is already empty", () => {
    const painted: PaintedSquares = new Map();
    paintCells(painted, 0, 0, 0, "#ff0000");
    eraseCells(painted, 10, 10, 0);
    expect(getCellColor(painted, 10, 10)).toBeUndefined();
    expect(getCellColor(painted, 0, 0)).toBe("#ff0000");
  });
});

describe("getCellColor", () => {
  it("returns the colour of a painted cell", () => {
    const painted: PaintedSquares = new Map([[3, new Map([[7, "#123456"]])]]);
    expect(getCellColor(painted, 7, 3)).toBe("#123456");
  });

  it("returns undefined for an empty row or column", () => {
    const painted: PaintedSquares = new Map([[3, new Map([[7, "#123456"]])]]);
    expect(getCellColor(painted, 7, 4)).toBeUndefined();
    expect(getCellColor(painted, 8, 3)).toBeUndefined();
  });

  it("returns undefined outside the grid", () => {
    const painted: PaintedSquares = new Map();
    paintCells(painted, 0, 0, 0, "#ff0000");
    expect(getCellColor(painted, -1, 0)).toBeUndefined();
    expect(getCellColor(painted, 0, 1000)).toBeUndefined();
  });
});
