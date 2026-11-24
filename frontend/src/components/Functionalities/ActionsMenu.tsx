import {
  faCircleNotch,
  faDownload,
  faEllipsis,
  faFloppyDisk,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import classes from "./ActionsMenu.module.css";
import tool from "./Tool.module.css";

const ActionsMenu = (props: {
  saving: boolean;
  shared: boolean;
  onSave: () => void;
  onDownload: () => void;
  onShare: () => void;
}) => {
  const isRegistered = !!localStorage.getItem("token");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click outside the menu or on Escape
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current!.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <div ref={ref} className={classes.menu}>
      <button
        className={tool.tool}
        aria-label="Project actions"
        title="Project actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FontAwesomeIcon icon={props.saving ? faCircleNotch : faEllipsis} spin={props.saving} />
      </button>
      {open && (
        <div role="menu" className={classes.list}>
          {isRegistered && (
            <button role="menuitem" onClick={run(props.onSave)}>
              <FontAwesomeIcon icon={faFloppyDisk} fixedWidth /> Save
            </button>
          )}
          <button role="menuitem" onClick={run(props.onDownload)}>
            <FontAwesomeIcon icon={faDownload} fixedWidth /> Download as PNG
          </button>
          {isRegistered && (
            <button role="menuitem" disabled={props.shared} onClick={run(props.onShare)}>
              <FontAwesomeIcon icon={faShareNodes} fixedWidth />
              {props.shared ? " Already shared" : " Share to community"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionsMenu;
