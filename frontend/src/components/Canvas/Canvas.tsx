import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { canvasActions } from "../../store/redux-store";
import classes from "./Canvas.module.css";
import {
  adjustcanvasWindowSize,
  Brushes,
  clearSquare,
  drawGrid,
  fillBucket,
  getInitialCanvas,
  getMousePos,
  getPositionOnCanvas,
  paintSquare,
  pickColor,
  rgbToHex,
} from "./CanvasOperations/canvas-utils";

const reducer = (
  state: {
    squareSize: number;
    cols: number;
    rows: number;
    zoom: number;
    startCol: number;
    startRow: number;
  },
  action: any
) => {
  switch (action.type) {
    case "FROM_MEMORY":
      return getInitialCanvas(adjustcanvasWindowSize());
    case "RESIZE":
      return { ...state, squareSize: action.newSize };
    case "ZOOMED":
      const velocity = 0.05;
      const newZoom =
        state.zoom +
        (action.direction < 0
          ? velocity * state.zoom
          : state.zoom > 1
          ? -velocity * state.zoom
          : 1 - state.zoom);
      // center around the zoomed square
      const col = action.column + 0.5;
      const row = action.row + 0.5;
      const squaresInScreen = state.cols / newZoom;
      const half = squaresInScreen / 2.0;

      let mx = Math.min(0, -(col - half));
      mx = Math.max(-(state.cols - squaresInScreen), mx);

      moved.x = mx; //-Math.max(,state.cols-squaresInScreen);
      let my = Math.min(0, -(row - half));
      my = Math.max(-(state.rows - squaresInScreen), my);

      moved.y = my; //-Math.max(,state.cols-squaresInScreen);
      console.log(state.cols);
      return {
        ...state,
        startRow: moved.y,
        startCol: moved.x,
        zoom: newZoom,
      };
    case "PANNED":
      return { ...state, startRow: action.row, startCol: action.column };

    default:
      return state;
  }
};

let canvasWindowSize = adjustcanvasWindowSize();

let lastPointSaved = { x: 0, y: 0 };
let moved = { x: 0, y: 0 };
let scrolled = 0;

let spacePressed = false;

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    spacePressed = true; //whatever you want to do when space is pressed
  }
});
document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spacePressed = false; //whatever you want to do when space is pressed
  }
});

const Canvas = React.forwardRef((props: any, ref: any) => {
  //from redux
  const canvasName = useSelector((state: any) => state.canvas.name);
  const isPanning = useSelector((state: any) => state.canvas.panning);
  const canvasSize = useSelector((state: any) => state.canvas.canvasSize);
  const pickingColor = useSelector((state: any) => state.canvas.pickingColor);
  const activeBrush = useSelector((state: any) => state.canvas.brush);
  const background = useSelector((state: any) => state.canvas.background);
  const [firstTimeBG, setFirstTimeBG] = useState(true);
  const dispatchRedux = useDispatch();

  const [mousePressed, setMousePressed]: [number | undefined, any] =
    useState(undefined);
  const [canvasInfo, dispatch] = useReducer(
    reducer,
    getInitialCanvas(canvasWindowSize)
  );

  useEffect(() => {
    console.log(canvasSize);
    dispatch({ type: "FROM_MEMORY", size: canvasSize });
  }, [canvasSize]);

  useEffect(() => {
    if (!background) {
      setFirstTimeBG(true);
    }
  }, [background]);

  const drawImage = useCallback(
    (ctx: any) => {
      const backgroundImage = new Image();

      backgroundImage.src = background;
      if (firstTimeBG) {
        backgroundImage.onload = () => {
          ctx.globalAlpha = 0.3;
          ctx.drawImage(
            backgroundImage,
            canvasInfo.startCol * canvasInfo.zoom * canvasInfo.squareSize,
            canvasInfo.startRow * canvasInfo.zoom * canvasInfo.squareSize,
            ctx.canvas.width * canvasInfo.zoom,
            ctx.canvas.height * canvasInfo.zoom
          );

          ctx.globalAlpha = 1.0;
          drawGrid(canvasInfo, ctx);
          setFirstTimeBG(false);
        };
      } else {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(
          backgroundImage,
          canvasInfo.startCol * canvasInfo.zoom * canvasInfo.squareSize,
          canvasInfo.startRow * canvasInfo.zoom * canvasInfo.squareSize,
          ctx.canvas.width * canvasInfo.zoom,
          ctx.canvas.height * canvasInfo.zoom
        );

        ctx.globalAlpha = 1.0;
        drawGrid(canvasInfo, ctx);
      }
    },
    [background, firstTimeBG, canvasInfo]
  );

  console.log(background);

  //Redraw the canvas on canvasInfo change, such as squareSize or zoom
  useEffect(() => {
    const canvas: HTMLCanvasElement = ref.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.globalAlpha = 1.0;
    ctx.canvas.width = ctx.canvas.height = canvasWindowSize;
    //
    if (background) {
      console.log("ran");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawImage(ctx);
    } else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalAlpha = 1.0;

      drawGrid(canvasInfo, ctx);
    }
  }, [canvasInfo, background, drawImage, ref]);

  //Listen to the resize of the window to keep the canvas right
  const resize = useCallback(() => {
    canvasWindowSize = adjustcanvasWindowSize();
    dispatch({
      type: "RESIZE",
      newSize: canvasWindowSize / canvasSize,
    });
  }, [canvasSize]);

  window.addEventListener("resize", resize);

  const dispatchPanned = (
    e: any,
    velocity: { x: number; y: number },
    set?: string
  ) => {
    if (!set) {
      moved.x += velocity.x;
      moved.y += velocity.y;
    } else {
      if (set === "x") moved.x = velocity.x;
      else if (set === "y") moved.y = velocity.y;
    }
    lastPointSaved.x = e.screenX;
    lastPointSaved.y = e.screenY;
    dispatch({
      type: "PANNED",
      column: moved.x,
      row: moved.y,
      horizontal: e.movementX,
    });
  };

  const handlePanning = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const limit = 5;
    const velocity = 0.3;
    const zoomedSquaredSize = canvasInfo.squareSize * canvasInfo.zoom;
    //sliding right (from left to right)
    if (e.screenX >= lastPointSaved.x + limit) {
      const colsInScreen = canvasWindowSize / zoomedSquaredSize;
      if (Math.abs(moved.x - velocity) + colsInScreen < canvasSize) {
        dispatchPanned(e, { x: -velocity, y: 0 });
      } else if (Math.abs(moved.x) + colsInScreen < canvasSize) {
        dispatchPanned(
          e,
          {
            x: -(canvasSize - colsInScreen),
            y: 0,
          },
          "x"
        );
      }
    }
    //sliding left (from right to left)
    if (e.screenX <= lastPointSaved.x - limit) {
      if (moved.x + velocity < 0) {
        dispatchPanned(e, { x: velocity, y: 0 });
      } else if (moved.x < 0) {
        dispatchPanned(e, { x: 0, y: 0 }, "x");
      }
    }

    if (e.screenY >= lastPointSaved.y + limit) {
      const rowsInScreen = canvasWindowSize / zoomedSquaredSize;
      if (Math.abs(moved.y - velocity) + rowsInScreen < canvasSize) {
        dispatchPanned(e, { y: -velocity, x: 0 });
      } else if (Math.abs(moved.y) + rowsInScreen < canvasSize) {
        dispatchPanned(
          e,
          {
            y: -(canvasSize - rowsInScreen),
            x: 0,
          },
          "y"
        );
      }
    }
    if (e.screenY <= lastPointSaved.y - limit) {
      if (moved.y + velocity < 0) {
        dispatchPanned(e, { y: velocity, x: 0 });
      } else if (moved.y < 0) {
        dispatchPanned(e, { y: 0, x: 0 }, "y");
      }
    }
  };

  const handleMouseMoved = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas: HTMLCanvasElement = ref.current!;
    const { startCol: sc, startRow: sr } = canvasInfo;
    const ctx = canvas.getContext("2d")!;
    const zoomedSquaredSize = canvasInfo.squareSize * canvasInfo.zoom;
    if (
      mousePressed === 0 &&
      !spacePressed &&
      !isPanning &&
      (activeBrush === Brushes.normal || activeBrush === Brushes.eraser)
    ) {
      const { x, y } = getMousePos(canvas, e);

      switch (activeBrush) {
        case Brushes.normal:
          paintSquare(x, y, sc, sr, zoomedSquaredSize, ctx);
          if (pickingColor) dispatchRedux(canvasActions.changePickingColor());
          break;

        case Brushes.eraser:
          clearSquare(x, y, sc, sr, zoomedSquaredSize, ctx);
          break;
      }
    } else if (
      mousePressed === 1 ||
      (mousePressed === 0 && spacePressed) ||
      (mousePressed === 0 && isPanning)
    ) {
      handlePanning(e);
    }
  };

  const handleMousePressed = (e: any) => {
    lastPointSaved = { x: e.clientX, y: e.clientY };
    const canvas: HTMLCanvasElement = ref.current!;
    const { x, y } = getMousePos(canvas, e);
    if (pickingColor) dispatchRedux(canvasActions.changePickingColor());
    const { col, row } = getPositionOnCanvas(canvas, e, canvasInfo);
    if (!spacePressed && !isPanning && e.button === 0) {
      switch (activeBrush) {
        case Brushes.fill:
          fillBucket(
            canvasSize,
            canvasInfo.rows,
            x,
            y,
            canvasInfo.startCol,
            canvasInfo.startRow,
            canvasInfo.squareSize * canvasInfo.zoom,
            canvas.getContext("2d")!
          );
          break;
        case Brushes.eye:
          if (
            pickColor(
              x,
              y,
              canvasInfo.startCol,
              canvasInfo.startRow,
              canvasInfo.squareSize * canvasInfo.zoom
            )
          ) {
          } else if (background) {
            const ctx = canvas.getContext("2d")!;
            const { data } = ctx.getImageData(x, y, 1, 1);
            const colors = new Uint8Array(data.buffer);
            const colorInImage = rgbToHex(colors[0], colors[1], colors[2]);
            dispatchRedux(canvasActions.changeColor({ color: colorInImage }));
          }
          break;
        case Brushes.eraser:
          clearSquare(
            x,
            y,
            canvasInfo.startCol,
            canvasInfo.startRow,
            canvasInfo.squareSize * canvasInfo.zoom,
            canvas.getContext("2d")!
          );
          break;
        case Brushes.normal:
          paintSquare(
            x,
            y,
            canvasInfo.startCol,
            canvasInfo.startRow,
            canvasInfo.squareSize * canvasInfo.zoom,
            canvas.getContext("2d")!
          );
          break;
        case Brushes.zoomin:
          dispatch({
            type: "ZOOMED",
            direction: -1,
            column: col,
            row: row,
          });
          break;
        case Brushes.zoomout:
          dispatch({
            type: "ZOOMED",
            direction: 1,
            column: col,
            row: row,
          });
          break;
      }
    }
    setMousePressed(e.button);
  };

  return (
    <div className={`${classes["canvas-holder"]}`}>
      <div className={`${classes.name}`}>{canvasName}</div>
      <canvas
        onMouseLeave={() => {
          setMousePressed(undefined);
        }}
        onMouseDown={handleMousePressed}
        onMouseUp={setMousePressed.bind(null, undefined)}
        onMouseMoveCapture={handleMouseMoved}
        onWheelCapture={(e) => {
          scrolled += e.deltaY;
          if (Math.abs(scrolled) > 10) {
            const canvas: HTMLCanvasElement = ref.current!;
            const { col, row } = getPositionOnCanvas(canvas, e, canvasInfo);
            dispatch({
              type: "ZOOMED",
              direction: e.deltaY,
              column: col,
              row: row,
            });
            scrolled = 0;
          }
        }}
        ref={ref}
        className={`${classes.canvas}`}
        id="myCanvas"
        width={canvasWindowSize}
        height={canvasWindowSize}
      />
    </div>
  );
});

export default Canvas;
