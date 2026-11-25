// Pick several options from a dropdown: each row has a checkbox, and choosing one
// keeps the panel open. `footer` adds controls under the list (e.g. "create new").
//
//   <MultiSelect label="Tags" options={[{ value: "Cats", label: "Cats" }]} values={tags} onChange={setTags} />
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useId } from "react";
import type { SelectOption } from "./Select";
import { Placement, useDropdown } from "./useDropdown";
import "./dropdown.css";

interface MultiSelectProps<V> {
  /** Text on the trigger and the list's accessible name */
  label: string;
  options: SelectOption<V>[];
  values: V[];
  onChange: (values: V[]) => void;
  placement?: Placement;
  /** Shown before the label on the trigger */
  icon?: ReactNode;
  /** Shown instead of the list when there are no options */
  emptyText?: string;
  /** Extra controls under the list; they don't close the panel */
  footer?: ReactNode;
}

export function MultiSelect<V extends string | number>({
  label,
  options,
  values,
  onChange,
  placement = "bottom-start",
  icon,
  emptyText = "Nothing to choose from",
  footer,
}: MultiSelectProps<V>) {
  const dd = useDropdown<HTMLButtonElement>();
  const id = useId();

  const toggle = (o: SelectOption<V>) => {
    if (o.disabled) return;
    onChange(values.includes(o.value) ? values.filter((v) => v !== o.value) : [...values, o.value]);
  };

  return (
    <div
      ref={dd.root}
      className="dd"
      // close when focus moves to something outside (Tab past the footer, for example).
      // No relatedTarget means focus went nowhere, e.g. a footer button became
      // disabled while it works: stay open. Clicks outside are handled by useDropdown.
      onBlur={(e) => {
        const to = e.relatedTarget as Node | null;
        if (dd.open && to && !dd.root.current?.contains(to)) dd.close(false);
      }}
    >
      <button
        ref={dd.trigger}
        type="button"
        className="dd__select"
        aria-haspopup="listbox"
        aria-expanded={dd.open}
        aria-label={values.length ? `${label}, ${values.length} selected` : label}
        onClick={dd.toggle}
        onKeyDown={dd.onTriggerKeyDown}
      >
        {icon}
        <span>{label}</span>
        {values.length > 0 && (
          <span className="dd__count" aria-hidden>
            {values.length}
          </span>
        )}
        <FontAwesomeIcon className="dd__chevron" icon={faChevronDown} />
      </button>
      {dd.open && (
        <div
          ref={dd.panel as React.RefObject<HTMLDivElement>}
          className={`dd__panel dd__panel--multi dd__panel--${placement}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              dd.close();
            }
          }}
        >
          {options.length === 0 ? (
            <p className="dd__empty">{emptyText}</p>
          ) : (
            <ul
              id={id}
              role="listbox"
              aria-label={label}
              aria-multiselectable="true"
              className="dd__list"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const value = (document.activeElement as HTMLElement)?.dataset.value;
                  const o = options.find((x) => String(x.value) === value);
                  if (o) toggle(o);
                  return;
                }
                // with a footer, Tab moves into it instead of closing
                if (e.key === "Tab" && footer) return;
                dd.onPanelKeyDown(e);
              }}
            >
              {options.map((o) => {
                const checked = values.includes(o.value);
                return (
                  <li
                    key={o.value}
                    role="option"
                    tabIndex={-1}
                    data-value={String(o.value)}
                    className="dd__item"
                    aria-selected={checked}
                    aria-disabled={o.disabled || undefined}
                    onClick={() => toggle(o)}
                  >
                    <span className="dd__box" aria-hidden>
                      {checked && <FontAwesomeIcon icon={faCheck} />}
                    </span>
                    {o.label}
                  </li>
                );
              })}
            </ul>
          )}
          {footer && <div className="dd__footer">{footer}</div>}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
