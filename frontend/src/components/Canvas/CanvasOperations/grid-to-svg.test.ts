import { describe, expect, it } from "vitest";
import { PaintedSquares } from "./grid-helpers";
import { gridToSvg } from "./grid-to-svg";

// Builds row -> (col -> colour) from [row, col, colour] triples
const cells = (...list: [number, number, string][]): PaintedSquares => {
  const painted: PaintedSquares = new Map();
  for (const [row, col, color] of list) {
    if (!painted.has(row)) painted.set(row, new Map());
    painted.get(row)!.set(col, color);
  }
  return painted;
};

const rects = (svg: string) => svg.match(/<rect [^>]*\/>/g) ?? [];

describe("gridToSvg", () => {
  it("returns an SVG with only a title for an empty grid", () => {
    const svg = gridToSvg({ cols: 4, rows: 4, cells: new Map() }, 10);
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain("<title>Pixel art</title>");
    expect(rects(svg)).toEqual([]);
  });

  it("draws a single pixel at its cell position", () => {
    const svg = gridToSvg({ cols: 4, rows: 4, cells: cells([2, 1, "#ff0000"]) }, 10);
    expect(rects(svg)).toEqual(['<rect x="10" y="20" width="10" height="10" fill="#ff0000"/>']);
  });

  it("merges horizontally adjacent cells of the same colour into one rect", () => {
    const svg = gridToSvg(
      { cols: 8, rows: 2, cells: cells([0, 1, "red"], [0, 2, "red"], [0, 3, "red"], [0, 5, "red"]) },
      5
    );
    expect(rects(svg)).toEqual([
      '<rect x="5" y="0" width="15" height="5" fill="red"/>',
      '<rect x="25" y="0" width="5" height="5" fill="red"/>',
    ]);
  });

  it("does not merge vertically or across colours", () => {
    const svg = gridToSvg(
      { cols: 3, rows: 2, cells: cells([0, 0, "red"], [0, 1, "blue"], [0, 2, "blue"], [1, 0, "red"]) },
      1
    );
    expect(rects(svg)).toEqual([
      '<rect x="0" y="0" width="1" height="1" fill="red"/>',
      '<rect x="1" y="0" width="2" height="1" fill="blue"/>',
      '<rect x="0" y="1" width="1" height="1" fill="red"/>',
    ]);
  });

  it("sizes the viewBox to the grid and clips cells outside it", () => {
    // The brush can paint past the edges, e.g. column -1 or row 3 on a 3x3 grid
    const svg = gridToSvg(
      { cols: 3, rows: 3, cells: cells([0, -1, "red"], [0, 0, "red"], [3, 0, "red"], [1, 3, "red"]) },
      16
    );
    expect(svg).toContain('width="48" height="48" viewBox="0 0 48 48"');
    expect(rects(svg)).toEqual(['<rect x="0" y="0" width="16" height="16" fill="red"/>']);
  });

  it("escapes the title and colours", () => {
    const svg = gridToSvg(
      { cols: 1, rows: 1, cells: cells([0, 0, '"/><script>']) },
      1,
      `Tom & Jerry's <cat>`
    );
    expect(svg).toContain("<title>Tom &#38; Jerry&#39;s &#60;cat&#62;</title>");
    expect(svg).not.toContain("<script>");
    expect(svg).not.toContain("<cat>");
  });
});
