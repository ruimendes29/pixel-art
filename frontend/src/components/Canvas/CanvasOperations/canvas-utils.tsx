import { BRUSH_INTERVAL, paintedSquares } from "./canvas-stored";
import store, { canvasActions } from "../../../store/redux-store";

export enum Brushes {
  normal,
  eye,
  fill,
  zoomin,
  zoomout,
  eraser,
}

export const getMousePos = (
  canvas: { getBoundingClientRect: () => any },
  evt: { clientX: number; clientY: number }
) => {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
};

export const getInitialCanvas = (size: number) => {
  let squareSize, cols, rows;
  const initial = store.getState().canvas.canvasSize;
  squareSize = size / initial;
  rows = initial;
  cols = initial;
  return {
    squareSize,
    cols,
    rows,
    zoom: 1,
    startRow: 0,
    startCol: 0,
  };
};

export const paintStoredSquares = (
  canvasInfo: {
    cols: number;
    squareSize: number;
    rows: number;
    zoom: number;
    startRow: number;
    startCol: number;
  },
  ctx: CanvasRenderingContext2D
) => {
  let { startCol, startRow, squareSize ,zoom} = canvasInfo;
  squareSize*=zoom;
  for (const [row, colMap] of paintedSquares) {
    for (const [col, color] of colMap) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(
        (startCol + col) * squareSize,
        (startRow + row) * squareSize,
        squareSize,
        squareSize
      );
      ctx.fill();
    }
  }
};

export const adjustcanvasWindowSize = () => {
  if (window.innerWidth <= 50 * 16) {
    return window.innerWidth * 0.9;
  }
  return Math.min(
    window.innerHeight * 0.85,
    window.innerWidth * 0.9 * 0.55 * 0.95
  );
};

export const drawGrid = (
  canvasInfo: {
    cols: number;
    squareSize: number;
    rows: number;
    zoom: number;
    startRow: number;
    startCol: number;
  },
  ctx: CanvasRenderingContext2D
) => {
  let { cols, squareSize, rows, zoom, startCol, startRow } = { ...canvasInfo };
  squareSize *= zoom;
  ctx.globalAlpha = 1.0;
  paintStoredSquares(canvasInfo, ctx);
  for (
    let c = -1 * (1 - startCol) * squareSize;
    c <= cols * squareSize;
    c += c === -1 * startCol ? squareSize : squareSize
  ) {
    ctx.beginPath();
    ctx.moveTo(c, 0);
    ctx.lineTo(c, ctx.canvas.height);
    ctx.stroke();
  }
  for (
    let r = -1 * (1 - startRow) * squareSize;
    r <= rows * squareSize;
    r += r === -1 * startRow ? squareSize : squareSize
  ) {
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(ctx.canvas.width, r);
    ctx.stroke();
  }
};

export const paintSquare = (
  x: number,
  y: number,
  sc: number,
  sr: number,
  zoomedSquaredSize: number,
  ctx: CanvasRenderingContext2D
) => {
  const realCol = Math.floor((x - sc * zoomedSquaredSize) / zoomedSquaredSize);
  const col = sc + Math.floor((x - sc * zoomedSquaredSize) / zoomedSquaredSize);
  const realRow = Math.floor((y - sr * zoomedSquaredSize) / zoomedSquaredSize);
  const row = sr + Math.floor((y - sr * zoomedSquaredSize) / zoomedSquaredSize);
  const brushSizeAux = Math.round(
    store.getState().canvas.size / BRUSH_INTERVAL
  );
  ctx.fillStyle = store.getState().canvas.color;
  for (let r = realRow - brushSizeAux; r <= realRow + brushSizeAux; r++) {
    for (let c = realCol - brushSizeAux; c <= realCol + brushSizeAux; c++) {
      if (!paintedSquares.has(r)) {
        paintedSquares.set(r, new Map());
      }
      const colMap = paintedSquares.get(r)!;
      colMap.set(c, ctx.fillStyle.toString());
    }
  }
  ctx.clearRect(
    (col - brushSizeAux) * zoomedSquaredSize,
    (row - brushSizeAux) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize
  );
  ctx.beginPath();

  ctx.rect(
    (col - brushSizeAux) * zoomedSquaredSize,
    (row - brushSizeAux) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize
  );
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.rect(
    (col - brushSizeAux) * zoomedSquaredSize,
    (row - brushSizeAux) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize
  );
  ctx.stroke();
};

export const getPositionOnCanvas = (
  canvas: HTMLCanvasElement,
  e: any,
  canvasInfo: any
) => {
  const { x, y } = getMousePos(canvas, e);
  const zoomedSquaredSize = canvasInfo.zoom * canvasInfo.squareSize;
  const realCol = Math.floor(
    (x - canvasInfo.startCol * zoomedSquaredSize) / zoomedSquaredSize
  );
  const realRow = Math.floor(
    (y - canvasInfo.startRow * zoomedSquaredSize) / zoomedSquaredSize
  );
  return { col: realCol, row: realRow };
};

export const clearSquare = (
  x: number,
  y: number,
  sc: number,
  sr: number,
  zoomedSquaredSize: number,
  ctx: CanvasRenderingContext2D
) => {
  const realCol = Math.floor((x - sc * zoomedSquaredSize) / zoomedSquaredSize);
  const col = sc + Math.floor((x - sc * zoomedSquaredSize) / zoomedSquaredSize);
  const realRow = Math.floor((y - sr * zoomedSquaredSize) / zoomedSquaredSize);
  const row = sr + Math.floor((y - sr * zoomedSquaredSize) / zoomedSquaredSize);
  const brushSizeAux = Math.round(
    store.getState().canvas.size / BRUSH_INTERVAL
  );
  for (let r = realRow - brushSizeAux; r <= realRow + brushSizeAux; r++) {
    for (let c = realCol - brushSizeAux; c <= realCol + brushSizeAux; c++) {
      if (!paintedSquares.has(r)) {
        paintedSquares.set(r, new Map());
      }
      const colMap = paintedSquares.get(r)!;
      if (colMap.has(c)) {
        colMap.delete(c);
      }
    }
  }

  ctx.beginPath();

  ctx.clearRect(
    (col - brushSizeAux) * zoomedSquaredSize,
    (row - brushSizeAux) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize
  );
  ctx.fillStyle = "black";
  ctx.rect(
    (col - brushSizeAux) * zoomedSquaredSize,
    (row - brushSizeAux) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize,
    (brushSizeAux * 2 + 1) * zoomedSquaredSize
  );
  ctx.stroke();
};

export const fillBucket = (
  cols: number,
  rows: number,
  x: number,
  y: number,
  sc: number,
  sr: number,
  zoomedSquaredSize: number,
  ctx: CanvasRenderingContext2D
) => {
  const realCol = Math.floor((x - sc * zoomedSquaredSize) / zoomedSquaredSize);
  const realRow = Math.floor((y - sr * zoomedSquaredSize) / zoomedSquaredSize);
  let hasColor = false;
  let colorToLookFor = "";
  let current: any = { col: realCol, row: realRow };
  const toVisitNext = [current];
  if (
    paintedSquares.has(realRow) &&
    paintedSquares.get(realRow)!.has(realCol)
  ) {
    hasColor = true;
    colorToLookFor = paintedSquares.get(realRow)!.get(realCol)!;
  }
  ctx.fillStyle = store.getState().canvas.color;

  while (
    toVisitNext.length > 0 &&
    current !== undefined &&
    colorToLookFor !== store.getState().canvas.color
  ) {
    current = toVisitNext.shift();
    if (
      paintedSquares.has(current.row) &&
      paintedSquares.get(current.row)!.has(current.col) &&
      paintedSquares.get(current.row)!.get(current.col)! === colorToLookFor
    ) {
      //add the current square to the maps holding the painted squares
      if (!paintedSquares.has(current.row)) {
        paintedSquares.set(current.row, new Map());
      }
      const colMap = paintedSquares.get(current.row)!;
      colMap.set(current.col, store.getState().canvas.color);

      // draw the rect in the canvas
      ctx.beginPath();
      ctx.rect(
        (sc + current.col) * zoomedSquaredSize,
        (sr + current.row) * zoomedSquaredSize,
        zoomedSquaredSize,
        zoomedSquaredSize
      );
      ctx.fill();

      // iterate over the adjactent squares to see if the color matches

      for (let j = -1; j <= 1; j++) {
        if (current.row + j >= 0 && current.row + j < rows) {
          for (let i = -1; i <= 1; i++) {
            if (
              current.col + i >= 0 &&
              current.col + i < cols &&
              !(i === 0 && j === 0)
            ) {
              if (
                hasColor &&
                paintedSquares.has(current.row + j) &&
                paintedSquares.get(current.row + j)!.has(current.col + i) &&
                paintedSquares.get(current.row + j)!.get(current.col + i)! ===
                  colorToLookFor
              ) {
                toVisitNext.push({
                  col: current.col + i,
                  row: current.row + j,
                });
              } else if (
                !hasColor &&
                (!paintedSquares.has(current.row + j) ||
                  (paintedSquares.has(current.row + j) &&
                    !paintedSquares.get(current.row + j)!.has(current.col + i)))
              ) {
              }
            }
          }
        }
      }
    }
  }
};

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export const pickColor = (
  x: number,
  y: number,
  sc: number,
  sr: number,
  zoomedSquaredSize: number
) => {
  const c = Math.floor((x - sc * zoomedSquaredSize) / zoomedSquaredSize);
  const r = Math.floor((y - sr * zoomedSquaredSize) / zoomedSquaredSize);
  if (paintedSquares.has(r) && paintedSquares.get(r)!.has(c)) {
    store.dispatch(
      canvasActions.changeColor({ color: paintedSquares.get(r)!.get(c)! })
    );
    return true;
  }
  return false;
};

export const drawBackgroundImage = (
  cols: number,
  rows: number,
  x: number,
  y: number,
  sc: number,
  sr: number,
  zoomedSquaredSize: number,
  ctx: CanvasRenderingContext2D
) => {};
