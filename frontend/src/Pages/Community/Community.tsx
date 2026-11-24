import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useState } from "react";
import Chip from "../../components/UI/Chip";
import classes from "./Community.module.css";
import FilterModal from "./FilterModal";
import Posts from "./Posts/Posts";
import SearchBar from "./SearchBar";
import { toggleTag } from "./tags";

export const SEARCH_DEBOUNCE_MS = 150;

const Community = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  // What is typed, and what is searched: the search waits 150 ms after the last keystroke
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSelectTag = (tag: string) => setSelectedTags((old) => toggleTag(old, tag));

  return (
    <Fragment>
      <div className={`${classes.community}`}>
        <div className={`${classes["search-header"]}`}>
          <SearchBar
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              if (!value) setSearch(""); // clearing applies at once
            }}
          />
          <div className={classes.filters}>
            {selectedTags.length > 0 && (
              <ul className={classes.tags} aria-label="Selected tags">
                {selectedTags.map((tag) => (
                  <li key={tag}>
                    <Chip onDelete={() => handleSelectTag(tag)} secondary clickable>
                      {tag}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
            <button
              className={classes["filter-button"]}
              aria-label="Filter by tags"
              title="Filter by tags"
              aria-expanded={showModal}
              onClick={() => setShowModal((open) => !open)}
            >
              <FontAwesomeIcon icon={faFilter} />
              {selectedTags.length > 0 && (
                <span className={classes.count} aria-hidden>
                  {selectedTags.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <Posts selectedCategories={selectedTags} search={search} />
      </div>
      {showModal && (
        <FilterModal
          onSelectTag={handleSelectTag}
          selectedTags={selectedTags}
          onClose={() => setShowModal(false)}
        />
      )}
    </Fragment>
  );
};

export default Community;
