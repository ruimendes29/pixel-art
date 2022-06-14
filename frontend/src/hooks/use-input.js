import { useReducer } from "react";

const TOUCHED = "TOUCHED";
const CHANGED = "CHANGED";
const RESET = "RESET";

const reducer = (state, action) => {
  switch (action.type) {
    case TOUCHED:
      return { enteredValue: state.enteredValue, touched: true };
    case CHANGED:
      return {enteredValue: action.newValue, touched:false };
    case RESET:
      return { enteredValue: "", touched: false };
    default:
      return state;
  }
};

const useInput = (validateFunction) => {
  const [inputState, dispatch] = useReducer(reducer, {
    enteredValue: "",
    touched: false,
  });
  const isValueValid = validateFunction(inputState.enteredValue);
  const isInputInvalid = !isValueValid && inputState.touched;

  const resetHandler = () => {
    dispatch({ type: RESET });
  };

  const touchedHandler = () => {
    dispatch({ type: TOUCHED });
  };

  const valueChanged = (event) => {
    dispatch({ type: CHANGED, newValue: event.target.value });
  };

  return {
    enteredValue: inputState.enteredValue,
    isValueValid,
    isInputInvalid,
    touchedHandler,
    valueChanged,
    resetHandler,
  };
};

export default useInput;
