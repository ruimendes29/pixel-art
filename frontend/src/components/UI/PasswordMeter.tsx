import React from "react";
import { PASSWORD_RULES } from "./password-rules";
import classes from "./PasswordMeter.module.css";

const STRENGTH_LABELS = [
  "",
  "Too weak",
  "Weak",
  "Getting there",
  "Almost there",
  "Strong password",
];

const PasswordMeter = (props: { value: string }) => {
  const met = PASSWORD_RULES.map((rule) => rule.test(props.value));
  const score = met.filter(Boolean).length;
  const total = PASSWORD_RULES.length;

  return (
    <div
      className={classes.meter}
      style={
        {
          "--fill": `${(score / total) * 100}%`,
          "--meter-color": `var(--strength-${Math.max(score, 1)})`,
        } as React.CSSProperties
      }
    >
      <div
        className={classes.track}
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={score}
        aria-valuetext={STRENGTH_LABELS[score] || "Empty"}
      >
        <div className={classes.fill} />
      </div>
      <div className={classes.status} aria-live="polite">
        {STRENGTH_LABELS[score]}
      </div>
      <ul className={classes.rules}>
        {PASSWORD_RULES.map((rule, i) => (
          <li key={rule.label} className={met[i] ? classes.met : ""}>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordMeter;
