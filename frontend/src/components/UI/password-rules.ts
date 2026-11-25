import { field, passesRule } from "../../fields/validate";

// The password checklist comes from the shared field rules (fields/fields.json),
// the same list the backend enforces at sign-up.
export type PasswordRule = { label: string; test: (value: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = field("password").rules!.map((rule) => ({
  label: rule.label,
  test: (value) => passesRule(rule, value),
}));

export const countMetRules = (value: string) =>
  PASSWORD_RULES.filter((rule) => rule.test(value)).length;

export const isPasswordStrong = (value: string) =>
  countMetRules(value) === PASSWORD_RULES.length;
