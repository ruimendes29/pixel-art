import React from "react";
import classes from "./Input.module.css";

const Input = (props: any) => {
  return (
    <div className={`${props.className} ${props.invalid ? classes.invalid : ""} ${classes.input}`}>
      <label htmlFor={`${props.name}`}>{props.name}</label>
      <div className={`${classes["invalid-text"]}`}>{props.error}</div>
      <input
        value={props.value}
        onBlur={props.onBlur}
        onChange={props.onChange}
        type={props.type || "text"}
        id={`${props.name}`}
      />
    </div>
  );
};

export default Input;
