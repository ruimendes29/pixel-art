import React from "react";
import classes from "./Modal.module.css";

const Modal = (props: {onClose:Function,className?:string,children?:any}) => {
  return (
    <div onClick={()=>{props.onClose()}} className={`${classes.backdrop}`}>
      <div onClick={e => {e.stopPropagation()}} className={`${props.className} ${classes.modal}`}>{props.children}</div>
    </div>
  );
};

export default Modal;
