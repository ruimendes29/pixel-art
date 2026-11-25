// Keyboard and mouse shortcuts of the editor. The same list drives the key
// handler (useToolShortcuts) and the Shortcuts panel next to the canvas, so the
// panel can never show a key that doesn't work.
import { Brushes } from "./CanvasOperations/brushes";

export type ShortcutAction = { brush: Brushes } | { panning: true };

export interface Shortcut {
  /** Keys as shown in the panel, e.g. ["Space", "drag"] */
  keys: string[];
  description: string;
  /** KeyboardEvent.key values that trigger it (lower case); none for mouse-only rows */
  triggers?: string[];
  action?: ShortcutAction;
}

export const SHORTCUTS: Shortcut[] = [
  { keys: ["B"], description: "Brush", triggers: ["b"], action: { brush: Brushes.normal } },
  { keys: ["E"], description: "Eraser", triggers: ["e"], action: { brush: Brushes.eraser } },
  { keys: ["G"], description: "Fill", triggers: ["g"], action: { brush: Brushes.fill } },
  { keys: ["I"], description: "Eyedropper", triggers: ["i"], action: { brush: Brushes.eye } },
  { keys: ["+"], description: "Zoom in", triggers: ["+", "="], action: { brush: Brushes.zoomin } },
  { keys: ["−"], description: "Zoom out", triggers: ["-", "_"], action: { brush: Brushes.zoomout } },
  { keys: ["H"], description: "Move tool", triggers: ["h"], action: { panning: true } },
  { keys: ["Space", "drag"], description: "Move the canvas" },
  { keys: ["Middle", "drag"], description: "Move (mouse)" },
  { keys: ["Wheel"], description: "Zoom" },
];

/** The shortcut a key press triggers, if any. Keys with Ctrl, Cmd or Alt are left to the browser. */
export const shortcutFor = (e: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}): Shortcut | undefined => {
  if (e.ctrlKey || e.metaKey || e.altKey) return undefined;
  const key = e.key.toLowerCase();
  return SHORTCUTS.find((s) => s.triggers?.includes(key));
};

/** Typing in a text field must never switch tools or start panning */
export const isTypingTarget = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
};
