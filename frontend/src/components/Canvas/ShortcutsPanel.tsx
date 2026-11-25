import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { canvasActions } from "../../store/redux-store";
import Tooltip from "../../tooltips/Tooltip";
import { isTypingTarget, SHORTCUTS, shortcutFor } from "./shortcuts";
import classes from "./ShortcutsPanel.module.css";

const STORAGE_KEY = "shortcuts-panel-open";

// Remembered per browser; storage can be blocked, so default to open
const readOpen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
};

/** Switches tools from the keyboard (see SHORTCUTS). */
const useToolShortcuts = () => {
  const isPanning = useSelector((state: any) => state.canvas.panning);
  const dispatchRedux = useDispatch();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || isTypingTarget(e.target)) return;
      const action = shortcutFor(e)?.action;
      if (!action) return;
      e.preventDefault();
      if ("panning" in action) {
        if (!isPanning) dispatchRedux(canvasActions.handlePanning());
        return;
      }
      if (isPanning) dispatchRedux(canvasActions.handlePanning());
      dispatchRedux(canvasActions.changeBrush({ brush: action.brush }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPanning, dispatchRedux]);
};

// Collapsible list of shortcuts on the canvas's left. The "?" tab sits on top
// of the card like a folder divider tab, and stays visible when collapsed.
const ShortcutsPanel = () => {
  const [open, setOpen] = useState(readOpen);
  useToolShortcuts();

  const toggle = () => {
    setOpen((o) => {
      try {
        localStorage.setItem(STORAGE_KEY, String(!o));
      } catch {
        // not remembered, still toggles
      }
      return !o;
    });
  };

  return (
    <aside className={`${classes.panel} ${open ? classes.open : ""}`}>
      <Tooltip
        placement="top"
        content={
          open
            ? "Hide the keyboard shortcuts"
            : "Keyboard shortcuts: keys for the tools, zoom and moving the canvas. Click to show them."
        }
      >
        <button
          type="button"
          className={classes.tab}
          aria-label="Keyboard shortcuts"
          aria-expanded={open}
          aria-controls="shortcuts-list"
          onClick={toggle}
        >
          <FontAwesomeIcon icon={faQuestion} />
        </button>
      </Tooltip>
      <div id="shortcuts-list" className={classes.card} hidden={!open}>
        <h2 className={classes.title}>Shortcuts</h2>
        <dl className={classes.list}>
          {SHORTCUTS.map((s) => (
            <Fragment key={s.description}>
              <dt className={classes.keys}>
                {s.keys.map((k, i) => (
                  <Fragment key={k}>
                    {i > 0 && <span className={classes.plus}>+</span>}
                    {k === "drag" ? <span className={classes.word}>drag</span> : <kbd>{k}</kbd>}
                  </Fragment>
                ))}
              </dt>
              <dd>{s.description}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </aside>
  );
};

export default ShortcutsPanel;
