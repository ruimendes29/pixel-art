import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import card from "../../components/UI/ArtCard.module.css";
import classes from "./Group.module.css";

const Group = (props: { onClick: () => void; name: string }) => (
  <button type="button" onClick={props.onClick} className={card.card}>
    <span className={`${card.thumb} ${classes.folder}`}>
      <FontAwesomeIcon icon={faFolderOpen} />
    </span>
    <span className={card.name}>{props.name}</span>
  </button>
);

export default Group;
