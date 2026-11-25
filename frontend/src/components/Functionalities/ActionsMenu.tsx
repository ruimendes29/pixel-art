import {
  faCircleNotch,
  faDownload,
  faEllipsis,
  faFloppyDisk,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Dropdown, DropdownItem } from "../../dropdown/Dropdown";
import tool from "./Tool.module.css";

// Project actions at the end of the toolbar. Opens upwards, since the toolbar
// sits at the bottom of the page.
const ActionsMenu = (props: {
  saving: boolean;
  shared: boolean;
  onSave: () => void;
  onDownload: () => void;
  onShare: () => void;
}) => {
  const isRegistered = !!localStorage.getItem("token");

  return (
    <Dropdown
      label="Project actions"
      title="Project actions"
      placement="top-end"
      triggerClassName={tool.tool}
      trigger={<FontAwesomeIcon icon={props.saving ? faCircleNotch : faEllipsis} spin={props.saving} />}
    >
      {isRegistered && (
        <DropdownItem icon={faFloppyDisk} onSelect={props.onSave}>
          Save
        </DropdownItem>
      )}
      <DropdownItem icon={faDownload} onSelect={props.onDownload}>
        Download as PNG
      </DropdownItem>
      {isRegistered && (
        <DropdownItem icon={faShareNodes} disabled={props.shared} onSelect={props.onShare}>
          {props.shared ? "Already shared" : "Share to community"}
        </DropdownItem>
      )}
    </Dropdown>
  );
};

export default ActionsMenu;
