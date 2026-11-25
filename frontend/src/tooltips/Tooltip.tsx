// Connects one element to the TooltipService. It has no state: hovering never re-renders anything.
import { cloneElement, useEffect, useRef } from "react";
import type {
  FocusEvent,
  HTMLAttributes,
  MouseEvent,
  PointerEvent,
  ReactElement,
} from "react";
import { tooltips } from "./TooltipService";
import type { TooltipTheme } from "./themes";
import type { Placement } from "./placement";
import "./tooltip.css";

interface Props {
  content: string;
  theme?: TooltipTheme;
  placement?: Placement;
  /** A single element (button, link…) that gets the events; it is not wrapped in another element. */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}

export function Tooltip({ content, theme = "default", placement = "top", children }: Props) {
  const anchor = useRef<HTMLElement | null>(null);

  // The text changed while open (e.g. "Add reference image" -> "Change reference image").
  useEffect(
    () => tooltips.update(anchor.current, content, { theme, placement, delayed: false }),
    [content, theme, placement]
  );
  // The element went away while its tooltip was open.
  useEffect(() => () => tooltips.hide(anchor.current), []);

  const open = (el: HTMLElement, delayed: boolean) => {
    anchor.current = el;
    tooltips.show(el, content, { theme, placement, delayed });
  };

  const p = children.props;
  return cloneElement(children, {
    "data-tooltip": "", // help cursor, only if the element has no cursor of its own (see tooltip.css)
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      p.onMouseEnter?.(e);
      open(e.currentTarget, true);
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      p.onMouseLeave?.(e);
      tooltips.hide(e.currentTarget);
    },
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      p.onPointerDown?.(e);
      tooltips.hide(e.currentTarget);
    },
    // Keyboard only: after a click focus stays on the button and the tooltip must not get stuck.
    onFocus: (e: FocusEvent<HTMLElement>) => {
      p.onFocus?.(e);
      if (e.currentTarget.matches(":focus-visible")) open(e.currentTarget, false);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      p.onBlur?.(e);
      tooltips.hide(e.currentTarget);
    },
  } as HTMLAttributes<HTMLElement>);
}

export default Tooltip;
