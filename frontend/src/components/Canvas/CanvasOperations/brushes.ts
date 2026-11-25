// Drawing tools. In its own file so the store and the shortcuts can import it
// without pulling in canvas-utils, which imports the store (import cycle).
export enum Brushes {
  normal,
  eye,
  fill,
  zoomin,
  zoomout,
  eraser,
}
