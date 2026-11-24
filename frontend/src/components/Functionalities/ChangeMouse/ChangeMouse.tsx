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
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { canvasActions } from "../../../store/redux-store";
import { Brushes } from "../../Canvas/CanvasOperations/canvas-utils";
import Slider from "../../UI/Slider";
import classes from "./ChangeMouse.module.css";
import OtherOptions from "./OtherOptions";

const ChangeMouse = () => {
  const color = useSelector((state: any) => state.canvas.color);
  const brushSize = useSelector((state: any) => state.canvas.size);
  const isPanning = useSelector((state: any) => state.canvas.panning);
  const brush = useSelector((state: any) => state.canvas.brush);
  const zooming = brush === Brushes.zoomin || brush === Brushes.zoomout;
  const dispatchRedux = useDispatch();
  return (
    <div className={`${classes["change-mouse-holder"]}`}>
      <OtherOptions
        label="Drawing tools"
        className={`${!zooming ? classes.selected : ""}`}
      >
        <FontAwesomeIcon
          onClick={() => {
            dispatchRedux(canvasActions.changeBrush({ brush: Brushes.normal }));
          }}
          icon={faPaintbrush}
          title="Brush"
        />
        <FontAwesomeIcon
          onClick={() => {
            dispatchRedux(canvasActions.changeBrush({ brush: Brushes.eraser}));
          }}
          icon={faEraser}
          title="Eraser"
        />
        <FontAwesomeIcon
          onClick={() => {
            dispatchRedux(canvasActions.changeBrush({ brush: Brushes.fill }));
          }}
          icon={faFillDrip}
          title="Fill"
        />
        <FontAwesomeIcon
          onClick={() => {
            dispatchRedux(canvasActions.changeBrush({ brush: Brushes.eye }));
          }}
          icon={faEyeDropperEmpty}
          title="Eyedropper"
        />
      </OtherOptions>
      <OtherOptions noAlternatives style={{ "--option-height": "25rem" }}>
        <div
          style={{
            backgroundColor: color,
            width: `calc(${Math.max(
              0.05,
              brushSize / 100
            )} * (0.9 * (var(--container-height) - 1rem)))`,
          }}
          className={`${classes.size}`}
        ></div>
        <Slider
          onChange={(newSize: number) => {
            dispatchRedux(canvasActions.changeSize({ size: newSize }));
          }}
          className={`${classes.slider}`}
          v
          interval={25}
          value={brushSize}
        />
      </OtherOptions>
      <OtherOptions
        label="Zoom tools"
        className={`${zooming ? classes.selected : ""}`}
      >
        <FontAwesomeIcon
          onClick={() => {
            dispatchRedux(canvasActions.changeBrush({ brush: Brushes.zoomin }));
          }}
          icon={faMagnifyingGlassPlus}
          title="Zoom in"
        />
        <FontAwesomeIcon
          onClick={() => {
            dispatchRedux(
              canvasActions.changeBrush({ brush: Brushes.zoomout })
            );
          }}
          icon={faMagnifyingGlassMinus}
          title="Zoom out"
        />
      </OtherOptions>
      <div
        className={`${classes.option}`}
        onClick={() => dispatchRedux(canvasActions.handlePanning())}
      >
        <FontAwesomeIcon icon={!isPanning ? faHand : faHandBackFist} />
      </div>
    </div>
  );
};

export default ChangeMouse;
