import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import classes from "./Chip.module.css";
import IconButton from "./IconButton";

const Chip = (props: any) => {
  return (
    <div
      className={`${props.className} ${
        props.secondary ? classes.secondary : classes.primary
      } ${classes.chip}`}
      onClick={props.onClick ? props.onClick : () => {}}
    >
      {props.children}
      {props.clickable && (
        <IconButton onClick={props.onDelete} icon={faXmark}/>
      )}
    </div>
  );
};

export default Chip;
