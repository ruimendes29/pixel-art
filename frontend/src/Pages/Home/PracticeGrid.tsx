import { faEraser, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import classes from "./PracticeGrid.module.css";

export const SIZE = 16;

// Starting drawing: a heart, so the grid shows what it is for before anyone touches it
const HEART = [
  "................",
  "................",
  "..cccc....cccc..",
  ".cccccc..cccccc.",
  ".cwwccccccccccc.",
  ".cwcccccccccccc.",
  ".cccccccccccccc.",
  ".cccccccccccccc.",
  "..cccccccccccc..",
  "...cccccccccc...",
  "....cccccccc....",
  ".....cccccc.....",
  "......cccc......",
  ".......cc.......",
  "................",
  "................",
];

const KEYS: Record<string, string> = { c: "var(--paint-coral)", w: "#ffc2b8" };

export const initialCells = () =>
  HEART.join("").split("").map((k) => KEYS[k] || "");

const PAINTS = [
  { name: "Ink", value: "var(--text)" },
  { name: "Teal", value: "var(--primary-color)" },
  { name: "Coral", value: "var(--paint-coral)" },
  { name: "Sun", value: "var(--paint-sun)" },
  { name: "Leaf", value: "var(--paint-leaf)" },
  { name: "Plum", value: "var(--paint-plum)" },
];

// Cell index under a pointer, or -1 outside the grid
export const cellAt = (rect: { left: number; top: number; width: number; height: number }, x: number, y: number) => {
  const col = Math.floor(((x - rect.left) / rect.width) * SIZE);
  const row = Math.floor(((y - rect.top) / rect.height) * SIZE);
  return col < 0 || row < 0 || col >= SIZE || row >= SIZE ? -1 : row * SIZE + col;
};

// Cells on the straight line from a to b (both included), so fast strokes leave no gaps
export const cellsBetween = (a: number, b: number) => {
  const [r0, c0, r1, c1] = [Math.floor(a / SIZE), a % SIZE, Math.floor(b / SIZE), b % SIZE];
  const steps = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  return Array.from({ length: steps + 1 }, (_, k) => {
    const t = steps ? k / steps : 0;
    return Math.round(r0 + (r1 - r0) * t) * SIZE + Math.round(c0 + (c1 - c0) * t);
  });
};

// Small paintable grid on the home page: try pixel art before opening the editor.
// Nothing is saved.
const PracticeGrid = () => {
  const [cells, setCells] = useState(initialCells);
  const [paint, setPaint] = useState(PAINTS[1].value);
  const last = useRef(-1); // last painted cell while the pointer is down, -1 when up

  const paintAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const i = cellAt(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY);
    if (i < 0) return;
    const line = last.current < 0 ? [i] : cellsBetween(last.current, i);
    last.current = i;
    setCells((old) => {
      const next = [...old];
      line.forEach((j) => (next[j] = paint));
      return next;
    });
  };
  const stop = () => (last.current = -1);

  return (
    <div className={classes.practice}>
      <div
        className={classes.grid}
        role="img"
        aria-label="Practice grid: paint on it with your mouse or finger"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          paintAt(e);
        }}
        onPointerMove={(e) => last.current >= 0 && paintAt(e)}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        {cells.map((c, i) => (
          <span key={i} style={c ? { backgroundColor: c } : undefined} />
        ))}
      </div>
      <div className={classes.palette} role="group" aria-label="Paint">
        {PAINTS.map((p) => (
          <button
            key={p.name}
            type="button"
            className={classes.swatch}
            style={{ backgroundColor: p.value }}
            aria-label={p.name}
            aria-pressed={paint === p.value}
            onClick={() => setPaint(p.value)}
          />
        ))}
        <button
          type="button"
          className={classes.tool}
          aria-label="Eraser"
          aria-pressed={paint === ""}
          onClick={() => setPaint("")}
        >
          <FontAwesomeIcon icon={faEraser} />
        </button>
        <button
          type="button"
          className={classes.tool}
          aria-label="Start over"
          onClick={() => setCells(initialCells())}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
      </div>
    </div>
  );
};

export default PracticeGrid;
