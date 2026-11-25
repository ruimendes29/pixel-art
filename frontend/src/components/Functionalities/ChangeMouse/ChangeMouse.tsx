import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faEraser,
  faEyeDropperEmpty,
  faFillDrip,
  faHand,
  faHandBackFist,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faPaintbrush,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { canvasActions } from "../../../store/redux-store";
import { Brushes } from "../../Canvas/CanvasOperations/canvas-utils";
import Tooltip from "../../../tooltips/Tooltip";
import tool from "../Tool.module.css";
import classes from "./ChangeMouse.module.css";

const TOOLS: {
  brush: Brushes;
  icon: IconDefinition;
  label: string;
  hint?: string;
}[] = [
  { brush: Brushes.normal, icon: faPaintbrush, label: "Brush" },
  { brush: Brushes.eraser, icon: faEraser, label: "Eraser" },
  { brush: Brushes.fill, icon: faFillDrip, label: "Fill" },
  {
    brush: Brushes.eye,
    icon: faEyeDropperEmpty,
    label: "Eyedropper",
    hint: "Also picks colours from the reference image behind the grid, not only from painted squares.",
  },
  { brush: Brushes.zoomin, icon: faMagnifyingGlassPlus, label: "Zoom in" },
  { brush: Brushes.zoomout, icon: faMagnifyingGlassMinus, label: "Zoom out" },
];

const ChangeMouse = () => {
  const color = useSelector((state: any) => state.canvas.color);
  const brushSize = useSelector((state: any) => state.canvas.size);
  const isPanning = useSelector((state: any) => state.canvas.panning);
  const brush = useSelector((state: any) => state.canvas.brush);
  const dispatchRedux = useDispatch();

  return (
    <div className={classes.group}>
      {TOOLS.map((t) => (
        <Tooltip key={t.label} content={t.label} hint={t.hint}>
          <button
            className={tool.tool}
            aria-label={t.label}
            aria-pressed={!isPanning && brush === t.brush}
            onClick={() => {
              if (isPanning) dispatchRedux(canvasActions.handlePanning());
              dispatchRedux(canvasActions.changeBrush({ brush: t.brush }));
            }}
          >
            <FontAwesomeIcon icon={t.icon} />
          </button>
        </Tooltip>
      ))}
      <Tooltip content="Move canvas">
        <button
          className={tool.tool}
          aria-label="Move canvas"
          aria-pressed={isPanning}
          onClick={() => dispatchRedux(canvasActions.handlePanning())}
        >
          <FontAwesomeIcon icon={isPanning ? faHandBackFist : faHand} />
        </button>
      </Tooltip>
      <Tooltip content="Brush size">
        <label className={classes.size}>
          <span
            className={classes.dot}
            style={{
              backgroundColor: color,
              transform: `scale(${Math.max(0.25, brushSize / 100)})`,
            }}
          />
          <input
            type="range"
            aria-label="Brush size"
            min={0}
            max={100}
            step={25}
            value={brushSize}
            onChange={(e) =>
              dispatchRedux(
                canvasActions.changeSize({
                  size: Math.max(1, Number(e.target.value)),
                }),
              )
            }
          />
        </label>
      </Tooltip>
    </div>
  );
};

export default ChangeMouse;
