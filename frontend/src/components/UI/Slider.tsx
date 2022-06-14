import React, { useCallback, useEffect, useState } from "react";
import classes from "./Slider.module.css";

const Slider = (props: { style?: any; v: any; className?: any; onChange?: any; interval?: any; value:any}) => {
  const [position, setPosition] = useState(props.value);

  const { onChange, interval, v } = props;

  const handleMouseMoved = useCallback(
    (e: MouseEvent) => {
      const line = document.querySelector<HTMLElement>(`.${classes.line}`)!;
      const rectline = line.getBoundingClientRect();
      const rectBall = document
        .querySelector<HTMLElement>(`.${classes.ball}`)!
        .getBoundingClientRect();
      let isMouseInside, newPosition;
      if (v) {
        isMouseInside =
          e.pageY > rectline.y && e.pageY < rectline.y + rectline.height;
        newPosition =
          ((e.pageY - (rectline.y + rectBall.height / 2)) / rectline.height) *
          100;
      } else {
        isMouseInside =
          e.pageX > rectline.x && e.pageX < rectline.x + rectline.width;
        newPosition =
          ((e.pageX - (rectline.x + rectBall.width / 2)) / rectline.width) *
          100;
      }
      if (isMouseInside) {
        if (interval) {
          newPosition = Math.round(newPosition / interval) * interval;
        }
        setPosition(Math.max(1, Math.min(newPosition, 100)));
        onChange(newPosition);
      }
    },
    [onChange, interval, v]
  );

  useEffect(() => {
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleMouseMoved);
    });
  }, [handleMouseMoved]);

  return (
    <div
      style={props.style}
      className={`${props.v ? classes.vertical : ""} ${classes.slider} ${
        props.className
      }`}
    >
      <div className={`${classes.line}`}>
        <div
          style={{ left: `${position}%` }}
          onMouseDown={() => {
            window.addEventListener("mousemove", handleMouseMoved);
          }}
          onMouseUp={() => {
            window.removeEventListener("mousemove", handleMouseMoved);
          }}
          className={`${classes.ball}`}
        ></div>
      </div>
    </div>
  );
};

export default Slider;
