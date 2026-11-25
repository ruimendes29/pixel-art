// Frontend side of the shared field rules in fields.json. The backend applies the
// same file the same way (backend/resources/fields.js), so the forms and the API
// always agree. Keep the two in step: fields.test.ts runs the same cases as the
// backend's test/fields.test.js.
import spec from "./fields.json";

export type FieldKey = keyof typeof spec.fields;

type Rule = { label: string; minLength?: number; pattern?: string };
type Field = {
  type: string;
  label: string;
  required: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  rules?: Rule[];
};
type FieldType = {
  requires: string[];
  trim?: boolean;
  pattern?: string;
  patternMessage?: string;
  decimals?: number;
};

const FIELDS = spec.fields as Record<string, Field>;
const TYPES = spec.types as Record<string, FieldType>;

export const MAX_TAGS = spec.limits.maxTags;
export const MAX_TAGS_CREATED_PER_USER = spec.limits.maxTagsCreatedPerUser;

// Every field must have what its type requires (e.g. a textarea a maxLength)
export const checkSpec = () => {
  for (const [key, field] of Object.entries(FIELDS)) {
    const type = TYPES[field.type];
    if (!type) throw new Error(`Field "${key}" has unknown type "${field.type}"`);
    for (const prop of type.requires) {
      if ((field as any)[prop] === undefined)
        throw new Error(`Field "${key}" (${field.type}) needs "${prop}"`);
    }
  }
};
checkSpec();

export const field = (key: FieldKey) => FIELDS[key];

const isEmpty = (raw: unknown) => raw === undefined || raw === null || raw === "";
const length = (text: string) => Array.from(text).length; // characters, like MySQL

export const passesRule = (rule: Rule, value: string) =>
  rule.minLength !== undefined ? length(value) >= rule.minLength : new RegExp(rule.pattern!).test(value);

const checkNumber = (f: Field, type: FieldType, raw: unknown) => {
  const text = typeof raw === "number" ? String(raw) : typeof raw === "string" ? raw.trim() : null;
  const decimals = type.decimals!;
  const allowed = decimals === 0 ? /^-?\d+$/ : new RegExp(`^-?\\d+(\\.\\d{1,${decimals}})?$`);
  if (text === null || !allowed.test(text)) {
    if (text !== null && /^-?\d+\.\d+$/.test(text)) {
      return decimals === 0
        ? `${f.label} must be a whole number`
        : `${f.label} can have at most ${decimals} decimal places`;
    }
    return `${f.label} must be a number`;
  }
  const n = Number(text);
  if (n < f.min! || n > f.max!) return `${f.label} must be between ${f.min} and ${f.max}`;
  return null;
};

const checkText = (f: Field, type: FieldType, value: string) => {
  if (length(value) > f.maxLength!) return `${f.label} can be at most ${f.maxLength} characters`;
  if (type.pattern && !new RegExp(type.pattern).test(value)) return `${f.label} ${type.patternMessage}`;
  const failed = (f.rules || []).filter((rule) => !passesRule(rule, value));
  if (failed.length) return `${f.label} needs: ${failed.map((r) => r.label.toLowerCase()).join(", ")}`;
  return null;
};

// The message to show for this value, or null when it is valid
export const validateField = (key: FieldKey, raw: unknown): string | null => {
  const f = FIELDS[key];
  const type = TYPES[f.type];
  const numeric = type.decimals !== undefined;
  if (isEmpty(raw) || (typeof raw === "string" && type.trim !== false && raw.trim() === "")) {
    return f.required ? `${f.label} can't be empty` : null;
  }
  if (numeric) return checkNumber(f, type, raw);
  if (typeof raw !== "string") return `${f.label} must be text`;
  return checkText(f, type, type.trim ? raw.trim() : raw);
};
