import { PaintedSquares } from "./grid-helpers";

export type Grid = { cols: number; rows: number; cells: PaintedSquares };

const escapeXml = (text: string) =>
  text.replace(/[<>&"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

// Builds a standalone SVG of the drawing. Empty cells are left out (transparent),
// cells outside the grid are clipped, and each horizontal run of same-coloured
// cells becomes one <rect>, so a 64x64 drawing doesn't turn into 4096 elements.
export const gridToSvg = (grid: Grid, cellSize: number, title = "Pixel art") => {
  const width = grid.cols * cellSize;
  const height = grid.rows * cellSize;
  const rects: string[] = [];

  for (let row = 0; row < grid.rows; row++) {
    const colMap = grid.cells.get(row);
    if (!colMap) continue;
    let col = 0;
    while (col < grid.cols) {
      const color = colMap.get(col);
      if (color === undefined) {
        col++;
        continue;
      }
      let end = col + 1;
      while (end < grid.cols && colMap.get(end) === color) end++;
      rects.push(
        `<rect x="${col * cellSize}" y="${row * cellSize}" width="${(end - col) * cellSize}" height="${cellSize}" fill="${escapeXml(color)}"/>`
      );
      col = end;
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" role="img">` +
    `<title>${escapeXml(title)}</title>` +
    rects.join("") +
    `</svg>`
  );
};
