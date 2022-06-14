import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import classes from "./IconButton.module.css";

const IconButton = (props: {
  style?:any
  className?: any;
  onClick: any;
  icon: IconProp;
}) => {
  return (
    <button
      className={`${classes["icon-button"]}`}
      onClick={props.onClick}
    >
      <FontAwesomeIcon className={`${props.className} ${classes.icon}`} icon={props.icon} />
    </button>
  );
};

export default IconButton;
