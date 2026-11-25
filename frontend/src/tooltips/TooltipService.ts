// One tooltip for the whole app, in a <div> on <body> driven directly through the DOM.
// Showing, hiding and moving it never goes through React state (no component re-renders) and
// there are no timers: the hover delay and the fade are CSS transitions.
import { TOOLTIP_THEMES } from "./themes";
import type { TooltipTheme } from "./themes";
import { placeTooltip } from "./placement";
import type { Placement } from "./placement";

const ID = "app-tooltip";
const HOVER_DELAY = "300ms";

export interface TooltipOptions {
  theme: TooltipTheme;
  placement: Placement;
  delayed: boolean;
  /** Optional tip shown under the text with a lightbulb. */
  hint?: string;
}

export class TooltipService {
  private el: HTMLDivElement | null = null;
  private anchor: HTMLElement | null = null;

  private node() {
    if (!this.el) {
      this.el = document.createElement("div");
      this.el.id = ID;
      this.el.setAttribute("role", "tooltip");
      this.el.className = "tooltip";
      document.body.appendChild(this.el);
    }
    return this.el;
  }

  /** Shows the tooltip next to `anchor` (or moves it there if it is open on another element). */
  show(anchor: HTMLElement, text: string, { theme, placement, delayed, hint }: TooltipOptions) {
    const el = this.node();
    if (this.anchor && this.anchor !== anchor) this.unlink(this.anchor);
    const wasOpen = el.classList.contains("is-open");
    this.anchor = anchor;
    el.textContent = text;
    if (hint) {
      const tip = document.createElement("span");
      tip.className = "tooltip__hint";
      const bulb = document.createElement("span");
      bulb.className = "tooltip__bulb";
      bulb.setAttribute("aria-hidden", "true");
      bulb.textContent = "💡";
      tip.append(bulb, hint);
      el.appendChild(tip);
    }
    const colors = TOOLTIP_THEMES[theme];
    el.style.setProperty("--tooltip-bg", colors.background);
    el.style.setProperty("--tooltip-fg", colors.color);
    // Already open (moving from one button to the next): switch at once, no second wait.
    el.style.setProperty("--tooltip-delay", delayed && !wasOpen ? HOVER_DELAY : "0s");
    const pos = placeTooltip(
      anchor.getBoundingClientRect(),
      el.getBoundingClientRect(),
      { width: window.innerWidth, height: window.innerHeight },
      placement
    );
    el.style.top = `${pos.top}px`;
    el.style.left = `${pos.left}px`;
    el.classList.remove("tooltip--top", "tooltip--bottom");
    el.classList.add(`tooltip--${pos.placement}`, "is-open");
    anchor.setAttribute(
      "aria-describedby",
      [anchor.getAttribute("aria-describedby"), ID].filter(Boolean).join(" ")
    );
    if (!wasOpen) this.listen(true);
  }

  /** Hides (with a transition). With `anchor`, only if the tooltip is on that element. */
  hide = (anchor?: HTMLElement | null) => {
    if (!this.anchor || (anchor && anchor !== this.anchor)) return;
    this.unlink(this.anchor);
    this.anchor = null;
    this.el?.classList.remove("is-open");
    this.listen(false);
  };

  /** The text changed: update it if the tooltip is open on that element. */
  update(anchor: HTMLElement | null, text: string, options: TooltipOptions) {
    if (anchor && anchor === this.anchor) this.show(anchor, text, { ...options, delayed: false });
  }

  private unlink(anchor: HTMLElement) {
    const rest = (anchor.getAttribute("aria-describedby") || "")
      .split(" ")
      .filter((x) => x && x !== ID);
    if (rest.length) anchor.setAttribute("aria-describedby", rest.join(" "));
    else anchor.removeAttribute("aria-describedby");
  }

  private onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.hide();
  };
  private onMove = () => this.hide();

  private listen(on: boolean) {
    const method = on ? "addEventListener" : "removeEventListener";
    window[method]("keydown", this.onKey as EventListener);
    // shortcut: closes on scroll/resize instead of following the element; enough for short hints.
    window[method]("scroll", this.onMove, true);
    window[method]("resize", this.onMove);
  }
}

export const tooltips = new TooltipService();
