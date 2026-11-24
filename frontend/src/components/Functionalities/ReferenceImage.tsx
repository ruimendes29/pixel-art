import { faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { canvasActions } from "../../store/redux-store";
import classes from "./ReferenceImage.module.css";
import tool from "./Tool.module.css";

// Floating button that puts a reference image behind the canvas grid
const ReferenceImage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const background = useSelector((state: any) => state.canvas.background);
  const dispatchRedux = useDispatch();

  const setBackground = (url: string) => {
    if (background) URL.revokeObjectURL(background);
    dispatchRedux(canvasActions.addBackground({ background: url }));
  };

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
      {background && (
        <button
          className={`${tool.tool} ${classes.button} ${classes.remove}`}
          aria-label="Remove reference image"
          title="Remove reference image"
          onClick={() => setBackground("")}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
      <button
        className={`${tool.tool} ${classes.button}`}
        aria-label={background ? "Change reference image" : "Add reference image"}
        title={background ? "Change reference image" : "Add reference image"}
        onClick={() => inputRef.current!.click()}
      >
        <FontAwesomeIcon icon={faImage} />
      </button>
    </div>
  );
};

export default ReferenceImage;
