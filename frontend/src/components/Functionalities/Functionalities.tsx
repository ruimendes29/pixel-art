import React from "react";
import ActionsMenu from "./ActionsMenu";
import ChangeMouse from "./ChangeMouse/ChangeMouse";
import ColorPicker from "./ColorPicker/ColorPicker/ColorPicker";
import classes from "./Functionalities.module.css";

// Toolbar under the canvas: colours, tools, then the project actions menu
const Functionalities = (props: {
  saving: boolean;
  shared: boolean;
  onSave: () => void;
  onDownload: () => void;
  onDownloadSvg: () => void;
  onShare: () => void;
}) => (
  <div className={classes.toolbar} role="toolbar" aria-label="Canvas tools">
    <ColorPicker />
    <span className={classes.divider} />
    <ChangeMouse />
    <span className={classes.divider} />
    <ActionsMenu {...props} />
  </div>
);

export default Functionalities;
