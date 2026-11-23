import { BRUSH_INTERVAL } from "./canvas-stored";

// row -> (col -> colour), the same shape as paintedSquares
export type PaintedSquares = Map<number, Map<number, string>>;

// Maps a point in canvas pixels to a grid cell. startCol/startRow are the pan
// offset in cells (0 or negative), zoomedSquareSize is squareSize * zoom.
export const getCellAt = (
  x: number,
  y: number,
  startCol: number,
  startRow: number,
  zoomedSquareSize: number
) => ({
  col: Math.floor((x - startCol * zoomedSquareSize) / zoomedSquareSize),
  row: Math.floor((y - startRow * zoomedSquareSize) / zoomedSquareSize),
});

// Brush slider value -> how many cells the brush reaches around the centre.
export const getBrushRadius = (brushSize: number) =>
  Math.round(brushSize / BRUSH_INTERVAL);

export const paintCells = (
  painted: PaintedSquares,
  col: number,
  row: number,
  radius: number,
  color: string
) => {
  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (!painted.has(r)) {
        painted.set(r, new Map());
      }
      painted.get(r)!.set(c, color);
    }
  }
};

export const eraseCells = (
  painted: PaintedSquares,
  col: number,
  row: number,
  radius: number
) => {
  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (!painted.has(r)) {
        painted.set(r, new Map());
      }
      painted.get(r)!.delete(c);
    }
  }
};

// Eyedropper lookup: the colour painted in a cell, or undefined if it is empty.
export const getCellColor = (painted: PaintedSquares, col: number, row: number) =>
  painted.get(row)?.get(col);
