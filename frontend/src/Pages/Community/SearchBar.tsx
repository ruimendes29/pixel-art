import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { field } from "../../fields/validate";
import classes from "./SearchBar.module.css";

// Searches as you type; the magnifier turns into a button that clears the search.
const SearchBar = (props: { value: string; onChange: (value: string) => void }) => {
  return (
    <div className={`${classes["search-bar"]}`}>
      <input
        type="search"
        aria-label="Search posts"
        placeholder="Search by name or description"
        maxLength={field("search").maxLength}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") props.onChange("");
        }}
      />
      {props.value ? (
        <button
          className={classes.clear}
          aria-label="Clear search"
          title="Clear search"
          onClick={() => props.onChange("")}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      ) : (
        <FontAwesomeIcon className={classes.icon} icon={faMagnifyingGlass} aria-hidden />
      )}
    </div>
  );
};

export default SearchBar;
