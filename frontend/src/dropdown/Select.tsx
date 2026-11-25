// Replacement for <select> with the same look as the menus: options get hover
// styles, which native <option> elements don't allow.
//
//   <Select label="Group" value={id} options={[{ value: 1, label: "Animals" }]} onChange={setId} />
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useId } from "react";
import { Placement, useDropdown } from "./useDropdown";
import "./dropdown.css";

export interface SelectOption<V> {
  value: V;
  label: string;
  disabled?: boolean;
}

interface SelectProps<V> {
  label: string;
  value: V | undefined;
  options: SelectOption<V>[];
  onChange: (value: V) => void;
  placeholder?: string;
  placement?: Placement;
  /** Extra class for the visible label */
  labelClassName?: string;
}

export function Select<V extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = "Choose…",
  placement = "bottom-start",
  labelClassName,
}: SelectProps<V>) {
  const dd = useDropdown<HTMLButtonElement>();
  const id = useId();
  const current = options.find((o) => o.value === value);

  const choose = (o: SelectOption<V>) => {
    if (o.disabled) return;
    onChange(o.value);
    dd.close();
  };

  return (
    <div ref={dd.root} className="dd" style={{ flexDirection: "column", width: "100%" }}>
      <span id={`${id}-label`} className={labelClassName}>
        {label}
      </span>
      <div className="dd" style={{ width: "100%" }}>
        <button
          ref={dd.trigger}
          type="button"
          className="dd__select"
          aria-haspopup="listbox"
          aria-expanded={dd.open}
          aria-labelledby={`${id}-label ${id}-value`}
          onClick={dd.toggle}
          onKeyDown={dd.onTriggerKeyDown}
        >
          <span id={`${id}-value`}>{current ? current.label : placeholder}</span>
          <FontAwesomeIcon className="dd__chevron" icon={faChevronDown} />
        </button>
        {dd.open && (
          <ul
            ref={dd.panel as React.RefObject<HTMLUListElement>}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className={`dd__panel dd__panel--${placement}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const i = options.findIndex((o) => String(o.value) === (document.activeElement as HTMLElement)?.dataset.value);
                if (i >= 0) choose(options[i]);
                return;
              }
              dd.onPanelKeyDown(e);
            }}
          >
            {options.map((o) => (
              <li
                key={o.value}
                role="option"
                tabIndex={-1}
                data-value={String(o.value)}
                className="dd__item"
                aria-selected={o.value === value}
                aria-disabled={o.disabled || undefined}
                onClick={() => choose(o)}
              >
                {o.label}
                {o.value === value && <FontAwesomeIcon className="dd__check" icon={faCheck} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Select;
