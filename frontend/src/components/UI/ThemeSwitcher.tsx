import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faDesktop, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { setThemePreference, ThemePreference, useThemePreference } from "../../theme/theme";
import Tooltip from "../../tooltips/Tooltip";
import classes from "./ThemeSwitcher.module.css";

const OPTIONS: { value: ThemePreference; icon: IconDefinition; label: string; hint: string }[] = [
  { value: "system", icon: faDesktop, label: "System theme", hint: "Follow your computer's light or dark setting" },
  { value: "light", icon: faSun, label: "Light theme", hint: "Always use the light theme" },
  { value: "dark", icon: faMoon, label: "Dark theme", hint: "Always use the dark theme" },
];

// Three-way switch in the navbar: System (default), Light, Dark. The choice is saved.
const ThemeSwitcher = () => {
  const preference = useThemePreference();
  return (
    <div className={classes.switcher} role="group" aria-label="Theme">
      {OPTIONS.map((o) => (
        <Tooltip key={o.value} content={o.hint} placement="bottom">
          <button
            type="button"
            className={classes.option}
            aria-label={o.label}
            aria-pressed={preference === o.value}
            onClick={() => setThemePreference(o.value)}
          >
            <FontAwesomeIcon icon={o.icon} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
