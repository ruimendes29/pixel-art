import React, { useState } from "react";
import classes from "./OtherOptions.module.css";

const OtherOptions = (props: any) => {
  const [open, setOpen] = useState(false);
  const [activeChild, setActiveChild] = useState(0);
  return (
    <div
      style={props.style}
      onClick={() => {
        setOpen((p) => !p);
      }}
      className={`${classes.option} ${props.className}`}
    >
      {open && !props.noAlternatives && (
        <div className={`${classes.open}`}>
          {props.children.map((el: any, index: number) => (
            <div
              className={`${classes.option}`}
              key={index}
              onClick={() => {
                setActiveChild(index);
                el.props.onClick();
              }}
            >
              {el}
            </div>
          ))}
        </div>
      )}
      {open && props.noAlternatives && (
        <div className={`${classes.open}`}>
          <div className={`${classes.option}`}>{props.children[0]}</div>
          {props.children.slice(1, props.children.length)}
        </div>
      )}
      {!open && props.children[activeChild]}
    </div>
  );
};

export default OtherOptions;
