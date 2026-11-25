// Backend side of the shared field rules. The rules themselves live in one file,
// frontend/src/fields/fields.json, which the frontend reads too
// (frontend/src/fields/validate.ts applies them the same way), so a request sent
// straight to the API is held to exactly what the forms check.
const spec = require("../../frontend/src/fields/fields.json");

// `field` (optional) is the input key the message belongs to, so the form can
// show it under that input
class ValidationError extends Error {
  constructor(message, field, status = 400) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

// Every field must have what its type requires (e.g. a textarea a maxLength).
// Checked once at load, so a bad spec stops the server instead of letting input through.
const checkSpec = ({ types, fields }) => {
  for (const [key, field] of Object.entries(fields)) {
    const type = types[field.type];
    if (!type) throw new Error(`Field "${key}" has unknown type "${field.type}"`);
    for (const prop of type.requires) {
      if (field[prop] === undefined) throw new Error(`Field "${key}" (${field.type}) needs "${prop}"`);
    }
  }
};
checkSpec(spec);

const isEmpty = (raw) => raw === undefined || raw === null || raw === "";
const length = (text) => Array.from(text).length; // characters, not UTF-16 units, like MySQL

const checkNumber = (field, type, raw) => {
  const text = typeof raw === "number" ? String(raw) : typeof raw === "string" ? raw.trim() : null;
  const decimals = type.decimals;
  const allowed = decimals === 0 ? /^-?\d+$/ : new RegExp(`^-?\\d+(\\.\\d{1,${decimals}})?$`);
  if (text === null || !allowed.test(text)) {
    if (text !== null && /^-?\d+\.\d+$/.test(text)) {
      return decimals === 0
        ? `${field.label} must be a whole number`
        : `${field.label} can have at most ${decimals} decimal places`;
    }
    return `${field.label} must be a number`;
  }
  const n = Number(text);
  if (n < field.min || n > field.max) return `${field.label} must be between ${field.min} and ${field.max}`;
  return null;
};

const checkText = (field, type, value) => {
  if (length(value) > field.maxLength) return `${field.label} can be at most ${field.maxLength} characters`;
  if (type.pattern && !new RegExp(type.pattern).test(value)) return `${field.label} ${type.patternMessage}`;
  const failed = (field.rules || []).filter((rule) =>
    rule.minLength !== undefined ? length(value) < rule.minLength : !new RegExp(rule.pattern).test(value)
  );
  if (failed.length) return `${field.label} needs: ${failed.map((r) => r.label.toLowerCase()).join(", ")}`;
  return null;
};

// { value, error }: value is cleaned (text trimmed, numbers as numbers), error is
// a sentence for the user or null.
const validateField = (key, raw) => {
  const field = spec.fields[key];
  if (!field) throw new Error(`Unknown field "${key}"`);
  const type = spec.types[field.type];
  const numeric = type.decimals !== undefined;

  if (isEmpty(raw) || (typeof raw === "string" && type.trim !== false && raw.trim() === "")) {
    if (field.required) return { value: null, error: `${field.label} can't be empty` };
    return { value: numeric ? null : "", error: null };
  }
  if (numeric) {
    const error = checkNumber(field, type, raw);
    return { value: error ? null : Number(raw), error };
  }
  if (typeof raw !== "string") return { value: null, error: `${field.label} must be text` };
  const value = type.trim ? raw.trim() : raw;
  return { value, error: checkText(field, type, value) };
};

// Checks { key: value, ... } and returns the cleaned values, or throws a
// ValidationError (HTTP 400) listing every problem.
const assertFields = (values) => {
  const cleaned = {};
  const errors = [];
  for (const [key, raw] of Object.entries(values)) {
    const { value, error } = validateField(key, raw);
    if (error) errors.push({ key, error });
    cleaned[key] = value;
  }
  if (errors.length) {
    // one problem: say which input it belongs to; several: the form shows them together
    const field = errors.length === 1 ? errors[0].key : undefined;
    throw new ValidationError(errors.map((e) => e.error).join(". "), field);
  }
  return cleaned;
};

module.exports = { spec, validateField, assertFields, checkSpec, ValidationError };
