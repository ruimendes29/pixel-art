import React from "react";
import classes from "./Button.module.css";

const Button = (props: any) => {
  return (
    <button
      className={`${classes.btn} ${props.className} ${
        props.primary
          ? classes.primary
          : props.secondary
          ? classes.secondary
          : ""
      } ${props.disabled ? classes.disabled : ""}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
