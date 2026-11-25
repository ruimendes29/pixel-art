// Action menu: a trigger button and a panel of menu items.
//
//   <Dropdown label="Project actions" placement="top-end" trigger={<FontAwesomeIcon icon={faEllipsis} />}>
//     <DropdownItem icon={faDownload} onSelect={download}>Download as PNG</DropdownItem>
//   </Dropdown>
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { createContext, ReactNode, useContext } from "react";
import { Placement, useDropdown } from "./useDropdown";
import "./dropdown.css";

const CloseContext = createContext<() => void>(() => {});

interface DropdownProps {
  /** Accessible name of the trigger button */
  label: string;
  /** Contents of the trigger button (icon, avatar, text…) */
  trigger: ReactNode;
  /** Extra class for the trigger button, to keep the project's own button look */
  triggerClassName?: string;
  placement?: Placement;
  /** Shown as a native tooltip on the trigger */
  title?: string;
  children: ReactNode;
}

export function Dropdown({
  label,
  trigger,
  triggerClassName,
  placement = "bottom-start",
  title,
  children,
}: DropdownProps) {
  const dd = useDropdown<HTMLButtonElement>();
  return (
    <div ref={dd.root} className="dd">
      <button
        ref={dd.trigger}
        type="button"
        className={triggerClassName}
        aria-label={label}
        title={title}
        aria-haspopup="menu"
        aria-expanded={dd.open}
        onClick={dd.toggle}
        onKeyDown={dd.onTriggerKeyDown}
      >
        {trigger}
      </button>
      {dd.open && (
        <div
          ref={dd.panel as React.RefObject<HTMLDivElement>}
          role="menu"
          aria-label={label}
          className={`dd__panel dd__panel--${placement}`}
          onKeyDown={dd.onPanelKeyDown}
        >
          <CloseContext.Provider value={dd.close}>{children}</CloseContext.Provider>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon?: IconDefinition;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function DropdownItem({ icon, disabled, onSelect, children }: DropdownItemProps) {
  const close = useContext(CloseContext);
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className="dd__item"
      // aria-disabled instead of disabled: the item stays focusable and readable
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (disabled) return;
        close();
        onSelect();
      }}
    >
      {icon && <FontAwesomeIcon icon={icon} fixedWidth />}
      {children}
    </button>
  );
}

export default Dropdown;
