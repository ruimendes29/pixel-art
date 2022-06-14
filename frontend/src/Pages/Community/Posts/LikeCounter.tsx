import { faHeart as heartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as heartReg } from "@fortawesome/free-regular-svg-icons";
import React from "react";
import IconButton from "../../../components/UI/IconButton";
import classes from "./LikeCounter.module.css";

const LikeCounter = (props: {
  likes: number;
  onLike: Function;
  liked: boolean;
  likable: boolean;
}) => {
  return (
    <div className={`${classes.counter}`}>
      <IconButton
        className={props.likable ? "" : classes["not-clickable"]}
        icon={props.liked ? heartSolid : heartReg}
        onClick={() => {
          props.onLike();
        }}
      />
      {props.likes}
    </div>
  );
};

export default LikeCounter;
