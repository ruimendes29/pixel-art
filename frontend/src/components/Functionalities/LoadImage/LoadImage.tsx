import React, { useRef, useState } from "react";
import classes from "./LoadImage.module.css";
import noImage from "../../../assets/images/no-image.svg";
import { useDispatch } from "react-redux";
import { canvasActions } from "../../../store/redux-store";
import { useSelector } from "react-redux";
import Button from "../../UI/Button";

const LoadImage = (props: any) => {
  const inputFile = useRef(null);
  const dispatchRedux = useDispatch();
  const background = useSelector((state: any) => state.canvas.background);
  const [selectedImage, setSelectedImage]: [File | null, any] = useState(null);

  const handleAddPhoto = () => {
    const input: HTMLInputElement = inputFile.current!;
    input.click();
  };

  return (
    <div className={`${classes.loader}`}>
      <input
        onChange={(newImage) => {
          const image = newImage.target.files![0];
          setSelectedImage(image);
        }}
        type="file"
        id="file"
        ref={inputFile}
        style={{ display: "none" }}
      />
      <img
        onClick={handleAddPhoto}
        className={`${classes.image}`}
        src={`${
          (selectedImage && URL.createObjectURL(selectedImage)) || noImage
        }`}
        alt="uploaded reference"
      />
      <Button
        primary
        className={`${classes.btn}`}
        onClick={handleAddPhoto}
      >
        Add reference photo
      </Button>

      {selectedImage && (
        <Button
          className={`${classes.btn}`}
          secondary
          onClick={() => {
            dispatchRedux(
              canvasActions.addBackground({
                background: background
                  ? ""
                  : URL.createObjectURL(selectedImage),
              })
            );
          }}
        >
          {!background
            ? `Set as canvas background`
            : `Remove image from background`}
        </Button>
      )}
    </div>
  );
};

export default LoadImage;
