import React, { useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import Button from "./Button";
import Modal from "./Modal";
import classes from "./AvatarCropModal.module.css";

const OUTPUT_SIZE = 512;

const cropToFile = async (src: string, area: Area, name: string) => {
  const image = new Image();
  image.src = src;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = Math.min(OUTPUT_SIZE, area.width);
  canvas.height = canvas.width;
  canvas
    .getContext("2d")!
    .drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not crop the image");
  return new File([blob], name.replace(/\.[^.]+$/, "") + ".png", { type: "image/png" });
};

const AvatarCropModal = (props: {
  file: File;
  onCancel: () => void;
  onSave: (cropped: File) => void;
}) => {
  const [src, setSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area>();
  const [error, setError] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(props.file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [props.file]);

  const save = async () => {
    try {
      props.onSave(await cropToFile(src, area!, props.file.name));
    } catch {
      setError("This image could not be cropped. Try another file.");
    }
  };

  return (
    <Modal onClose={props.onCancel} className={classes.modal}>
      <h2 className={classes.title}>Crop your profile picture</h2>
      <p className={classes.hint}>Drag to move it. Scroll or use the slider to zoom.</p>
      <div className={classes.stage}>
        {src && (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            objectFit="cover"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        )}
      </div>
      <label className={classes.zoom}>
        Zoom
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </label>
      {error && <p className={classes.error}>{error}</p>}
      <div className={classes.actions}>
        <Button secondary onClick={props.onCancel}>
          Cancel
        </Button>
        <Button primary disabled={!area} onClick={area ? save : undefined}>
          Use this picture
        </Button>
      </div>
    </Modal>
  );
};

export default AvatarCropModal;
