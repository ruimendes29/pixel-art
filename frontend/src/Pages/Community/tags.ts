import { field } from "../../fields/validate";

// Tag categories offered in the tag picker. "Custom" holds tags people type in.
export const PRESET_TAGS = new Map<string, string[]>([
  ["Anime", ["Naruto", "Pokemon", "Death Note", "Doraemon"]],
  ["Soccer", ["Ronaldo", "Messi", "Aubameyang"]],
  ["Animals", ["Dogs", "Cats", "Horses"]],
  ["Cities", ["London", "Porto", "Milan"]],
]);
export const CUSTOM_CATEGORY = "Custom";

// From the shared field rules (fields/fields.json), which the backend applies too
export const MAX_TAG_LENGTH = field("tag").maxLength!;

const ALL_PRESETS = Array.from(PRESET_TAGS.values()).flat();

const sameTag = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const hasTag = (tags: string[], tag: string) => tags.some((t) => sameTag(t, tag));

export const isPresetTag = (tag: string) => hasTag(ALL_PRESETS, tag);

// What a typed tag is stored as: trimmed, single spaces, at most 50 characters,
// and spelled like the preset when it matches one ("pokemon" -> "Pokemon").
// Returns "" for input that is only whitespace.
export const normalizeTag = (raw: string) => {
  const tag = raw.trim().replace(/\s+/g, " ").slice(0, MAX_TAG_LENGTH).trim();
  return ALL_PRESETS.find((preset) => sameTag(preset, tag)) ?? tag;
};

// Selects the tag, or deselects it if it is already selected (ignoring case).
export const toggleTag = (selected: string[], tag: string) =>
  hasTag(selected, tag) ? selected.filter((t) => !sameTag(t, tag)) : [...selected, tag];
