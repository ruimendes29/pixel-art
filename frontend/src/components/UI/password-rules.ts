export type PasswordRule = { label: string; test: (value: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "8 or more characters", test: (v) => v.length >= 8 },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
  {
    label: "A symbol, like ! or #",
    test: (v) => /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(v),
  },
];

export const countMetRules = (value: string) =>
  PASSWORD_RULES.filter((rule) => rule.test(value)).length;

export const isPasswordStrong = (value: string) =>
  countMetRules(value) === PASSWORD_RULES.length;
