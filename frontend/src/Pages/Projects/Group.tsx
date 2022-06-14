import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment } from "react";
import classes from "./Group.module.css";

const Group = (props: {onClick:any, name: string;}) => {
  return (
    <Fragment>
      <div
        onClick={props.onClick}
        className={`${classes.group}`}
      >
        <FontAwesomeIcon className={`${classes.folder}`} icon={faFolderOpen} />
        <div className={`${classes.name}`}>{props.name}</div>
      </div>
    </Fragment>
  );
};

export default Group;
