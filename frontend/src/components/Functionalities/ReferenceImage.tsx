import { faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { canvasActions } from "../../store/redux-store";
import Tooltip from "../../tooltips/Tooltip";
import classes from "./ReferenceImage.module.css";
import tool from "./Tool.module.css";

// Button beside the canvas's top-right corner that puts a reference image
// behind the grid; its tooltip (see src/tooltips) explains what it is for
const ReferenceImage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const background = useSelector((state: any) => state.canvas.background);
  const dispatchRedux = useDispatch();

  const setBackground = (url: string) => {
    if (background) URL.revokeObjectURL(background);
    dispatchRedux(canvasActions.addBackground({ background: url }));
  };

  const label = background ? "Change reference image" : "Add reference image";

  return (
    <div className={classes.fab}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        aria-label="Reference image file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setBackground(URL.createObjectURL(file));
          e.target.value = "";
        }}
      />
      <Tooltip
        placement="bottom"
        content={`${label}: load a picture that shows faintly behind the grid so you can trace over it. It is only a guide: it is not saved with the project or included in downloads.`}
        hint="Use the eyedropper on the image to pick its colours for your palette."
      >
        <button
          className={`${tool.tool} ${classes.button}`}
          aria-label={label}
          onClick={() => inputRef.current!.click()}
        >
          <FontAwesomeIcon icon={faImage} />
        </button>
      </Tooltip>
      {background && (
        <Tooltip
          placement="bottom"
          content="Remove the reference image from behind the grid. Your drawing is not affected."
        >
          <button
            className={`${tool.tool} ${classes.button} ${classes.remove}`}
            aria-label="Remove reference image"
            onClick={() => setBackground("")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default ReferenceImage;
