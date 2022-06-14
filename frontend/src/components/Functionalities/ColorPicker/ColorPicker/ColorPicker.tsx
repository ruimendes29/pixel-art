import React, { useReducer} from "react";
import classes from "./ColorPicker.module.css";
import { ChromePicker } from "react-color";
import Pallete from "./Pallete";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { canvasActions } from "../../../../store/redux-store";

const ColorPicker = () => {
  const color = useSelector((state: any) => state.canvas.color);
  const pickingColor = useSelector((state: any) => state.canvas.pickingColor);
  const dispatchRedux = useDispatch();

  const reducer = (state: { colors: string[] }, action: any) => {
    switch (action.type) {
      case "ADD_COLOR":
        return {
          ...state,
          pickingColor: false,
          colors: [ ...state.colors.slice(0,8),color].slice(0, 9),
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    colors: [],
  });

  return (
    <div className={`${classes["color-picker"]}`}>
      <div
        onClick={() => {
          dispatchRedux(canvasActions.changePickingColor());
        }}
        style={{ backgroundColor: color }}
        className={`${classes["current-color"]}`}
      ></div>
      <Pallete
        onClickedColor={(c: string) => {
          dispatchRedux(canvasActions.changeColor({ color: c}));
        }}
        onAddColor={() => {
          dispatch({ type: "ADD_COLOR" });
        }}
        colors={state.colors}
      />

      {pickingColor && (
        <ChromePicker
          className={`${classes.cp}`}
          color={color}
          disableAlpha
          onChange={(c) => {
            dispatchRedux(canvasActions.changeColor({ color: c.hex }));
          }}
        />
      )}
    </div>
  );
};

export default ColorPicker;
