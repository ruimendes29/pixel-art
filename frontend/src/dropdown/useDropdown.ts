// Open/close and keyboard behaviour shared by Dropdown (menu) and Select (listbox).
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

const ITEMS = '[role="menuitem"]:not([aria-disabled="true"]), [role="option"]:not([aria-disabled="true"])';

export type Placement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export function useDropdown<T extends HTMLElement = HTMLButtonElement>() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<T>(null);
  const panel = useRef<HTMLElement>(null);
  /** Item to focus when the panel opens: "first", "last" or "selected" */
  const focusOnOpen = useRef<"first" | "last" | "selected">("selected");

  const items = () => Array.from(panel.current?.querySelectorAll<HTMLElement>(ITEMS) ?? []);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }, []);

  const openWith = (focus: "first" | "last" | "selected") => {
    focusOnOpen.current = focus;
    setOpen(true);
  };

  // Click outside closes without stealing focus; so does focus leaving the dropdown
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, close]);

  // Move focus into the panel once it is rendered
  useEffect(() => {
    if (!open) return;
    const list = items();
    const selected = panel.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    const target =
      focusOnOpen.current === "last"
        ? list[list.length - 1]
        : focusOnOpen.current === "selected" && selected
        ? selected
        : list[0];
    target?.focus();
  }, [open]);

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openWith(e.key === "ArrowDown" ? "first" : "selected");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openWith("last");
    }
  };

  const onPanelKeyDown = (e: KeyboardEvent) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const move = (i: number) => list[(i + list.length) % list.length]?.focus();
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(index + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(index - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(list.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return {
    open,
    setOpen,
    close,
    toggle: () => (open ? close(false) : openWith("selected")),
    root,
    trigger,
    panel,
    onTriggerKeyDown,
    onPanelKeyDown,
  };
}
